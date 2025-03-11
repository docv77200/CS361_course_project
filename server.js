const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const axios = require('axios'); // Import axios for microservice requests

const app = express();

// Define paths
const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');
const dataPath = path.join(__dirname, 'data');

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Handlebars setup
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('views', viewsPath);
app.set('view engine', 'handlebars');

// Middleware
app.use(express.static(publicPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load user data
function loadUserData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'user.json'), 'utf-8'));
    } catch (error) {
        console.error('Error loading user.json:', error);
        return {};
    }
}

function saveUserData(data) {
    fs.writeFileSync(path.join(dataPath, 'user.json'), JSON.stringify(data, null, 2));
}

// Load all activity data
function loadActivityData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'activities.json'), 'utf-8')).activities;
    } catch (error) {
        console.error('Error loading activities.json:', error);
        return [];
    }
}

// ---------------------- Routes ---------------------- //

// 🏠 Default route - Sign-in page
app.get('/', (req, res) => {
    res.render('signin', { title: 'Sign In' });
});

// 📝 Handle Sign-in
app.post('/signin', (req, res) => {
    const { username, password } = req.body;
    const userData = loadUserData();

    if (userData.username === username && userData.password === password) {
        req.session.user = { username: userData.username, city: userData.city, interests: userData.interests };
        return res.redirect('/home');
    }

    res.render('signin', { title: 'Sign In', error: 'Invalid username or password.' });
});

// 🏠 Home Page - Requires Login
app.get('/home', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('home', { title: 'Home', user: req.session.user });
});

// 🌍 Route: Explore Page (Fetch recommendations from microservice)
app.get('/explore', async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const userData = loadUserData();
    const { city, interests } = userData;
    const activities = loadActivityData();

    try {
        const response = await axios.post('http://127.0.0.1:6767/recommendations', {
            location: city,
            activity_type: interests.join(", "), 
            budget: "$50"
        });

        const recommendedActivities = response.data;

        // Sort recommended activities to the top
        const sortedActivities = [
            ...recommendedActivities, 
            ...activities.filter(act => !recommendedActivities.some(r => r.name === act.name))
        ];

        res.render('explore', { 
            title: 'Explore Activities', 
            user: req.session.user, 
            activities: sortedActivities 
        });
    } catch (error) {
        console.error("❌ Error fetching recommendations:", error.message);
        res.render('explore', { 
            title: 'Explore Activities', 
            user: req.session.user, 
            activities 
        });
    }
});

// 📢 Send Notification (Calls Notification Microservice)
app.post('/api/notify', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        await axios.post('http://127.0.0.1:3000/send-notification', { text: message });
        res.json({ success: true, message: "Notification sent successfully!" });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ error: "Failed to send notification" });
    }
});

// 👤 Profile Setup Page (GET)
app.get('/profile', (req, res) => {
    res.render('profilesetup', { title: 'Create an Account' });
});

// 👤 Profile Setup Page (POST) - Create an account
app.post('/profile', (req, res) => {
    const { username, password, securityQuestion, securityAnswer, city, interests } = req.body;
    
    let userInterests = Array.isArray(interests) ? interests : [interests];

    if (!username || !password || !securityQuestion || !securityAnswer || !city || userInterests.length === 0) {
        return res.status(400).render('profilesetup', { title: 'Create an Account', error: 'All fields are required.' });
    }

    const newUser = {
        username,
        password,
        securityQuestion,
        securityAnswer,
        city, 
        interests: userInterests,
        bookmarkedActivities: []
    };

    saveUserData(newUser);
    res.redirect('/');
});

// 🔑 Forgot Password (GET)
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: 'Forgot Password' });
});

// 🔑 Forgot Password (POST)
app.post('/forgot-password', (req, res) => {
    const { username, securityAnswer } = req.body;
    const userData = loadUserData();

    if (userData.username === username && userData.securityAnswer === securityAnswer) {
        res.render('reset-password', { title: 'Reset Password', user: username });
    } else {
        res.render('forgot-password', { title: 'Forgot Password', error: 'Invalid username or security answer.' });
    }
});

// 🔑 Reset Password (GET)
app.get('/reset-password', (req, res) => {
    res.render('reset-password', { title: 'Reset Password' });
});

// 🔑 Reset Password (POST)
app.post('/reset-password', (req, res) => {
    const { username, newPassword } = req.body;
    let userData = loadUserData();

    if (userData.username === username) {
        userData.password = newPassword;
        saveUserData(userData);
        return res.redirect('/');
    }

    res.render('reset-password', { title: 'Reset Password', error: 'Username not found.' });
});

// 🎟️ Activity Details Page
app.get('/activity/:id', (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const activities = loadActivityData();
    const activity = activities.find(act => act.id === req.params.id);

    if (!activity) {
        return res.status(404).render('error', { title: 'Activity Not Found', message: 'The requested activity does not exist.' });
    }

    res.render('activity', { title: activity.name, user: req.session.user, activity });
});

// 🚪 Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.post("/api/filter-activities", async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "User not authenticated" });

    try {
        const { location, activityType, budget } = req.body;
        const response = await axios.post("http://127.0.0.1:6767/recommendations", {
            location,
            activity_type: activityType,
            budget
        });

        res.json({ success: true, activities: response.data });
    } catch (error) {
        console.error("Error fetching filtered activities:", error.message);
        res.status(500).json({ error: "Failed to fetch activities" });
    }
});


app.post('/api/bookmark', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'User not authenticated' });

    const { activityId, action } = req.body;

    // 🔍 Debugging Logs
    console.log("📩 Received Bookmark Request:", req.body);
    console.log("🛠 Activity ID:", activityId, " | Action:", action);

    if (!activityId || !action) {
        console.log("❌ Error: Missing required fields.");
        return res.status(400).json({ error: "Missing activityId or action" });
    }

    if (action !== "add" && action !== "remove") {
        console.log("❌ Invalid action received:", action);
        return res.status(400).json({ error: "Invalid action" });
    }

    const userData = loadUserData();
    const username = req.session.user.username;

    if (!userData.username || userData.username !== username) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!Array.isArray(userData.bookmarkedActivities)) {
        userData.bookmarkedActivities = [];
    }

    const activities = loadActivityData();
    const activity = activities.find(act => act.id === activityId);

    if (!activity) {
        console.log("❌ Error: Activity not found!");
        return res.status(404).json({ error: "Activity not found" });
    }

    let message = "";

    if (action === "add" && !userData.bookmarkedActivities.includes(activityId)) {
        userData.bookmarkedActivities.push(activityId);
        message = `"${activity.name}" added to your bookmarks!`;
    } else if (action === "remove" && userData.bookmarkedActivities.includes(activityId)) {
        userData.bookmarkedActivities = userData.bookmarkedActivities.filter(id => id !== activityId);
        message = `"${activity.name}" removed from your bookmarks!`;
    } else {
        console.log("❌ Invalid action received:", action);
        return res.status(400).json({ error: "Invalid action" });
    }

    saveUserData(userData);

    // 📢 Call the Notification Microservice
    try {
        await axios.post('http://127.0.0.1:3000/send-notification', { text: message });
        console.log("✅ Notification Sent:", message);
    } catch (error) {
        console.error("❌ Error sending notification:", error.message);
    }

    res.status(200).json({ success: true, message, bookmarkedActivities: userData.bookmarkedActivities });
});

app.get('/api/get-bookmarks', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'User not authenticated' });

    const userData = loadUserData();
    const bookmarkedIds = userData.bookmarkedActivities || [];
    const activities = loadActivityData();

    // Map IDs to full activity objects
    const bookmarkedActivities = bookmarkedIds
        .map(id => activities.find(activity => activity.id === id))
        .filter(activity => activity !== undefined); // Remove any undefined values

    res.status(200).json({ success: true, bookmarkedActivities });
});

app.get("/api/reviews/:activityId", async (req, res) => {
    try {
        const response = await axios.get(`http://127.0.0.1:5002/reviews/${req.params.activityId}`);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

app.post("/api/reviews", async (req, res) => {
    try {
        const response = await axios.post("http://127.0.0.1:5002/reviews", req.body);
        res.json(response.data);
    } catch (error) {
        console.error("Error submitting review:", error.message);
        res.status(500).json({ error: "Failed to submit review" });
    }
});




// 🚀 Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
