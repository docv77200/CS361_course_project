const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');

const app = express();

const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');
const dataPath = path.join(__dirname, 'data');
const session = require('express-session');

app.use(session({
    secret: 'your-secret-key',  // Change this to a secure secret in production
    resave: false,
    saveUninitialized: true
}));

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('views', viewsPath);
app.set('view engine', 'handlebars');

app.use(express.static(publicPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Mock data for user authentication and security questions
function loadUserData() {
    return JSON.parse(fs.readFileSync(path.join(dataPath, 'user.json'), 'utf-8'));
}

function saveUserData(data) {
    fs.writeFileSync(path.join(dataPath, 'user.json'), JSON.stringify(data, null, 2));
}

// Routes

// Default route - Display the Sign-in page
app.get('/', (req, res) => {
    res.render('signin', { title: 'Sign In' });
});

// Handle Sign-in POST request
app.post('/signin', (req, res) => {
    const { username, password } = req.body;
    const userData = loadUserData();

    // Check if username and password match
    if (userData.username === username && userData.password === password) {
        // Store user data in the session
        req.session.user = { username: userData.username };

        // Redirect to home page with username
        return res.render('home', { title: 'Home', username: req.session.user.username });
    }

    res.render('signin', { title: 'Sign In', error: 'Invalid username or password.' });
});


// Profile Setup Page (GET and POST)
app.get('/profile', (req, res) => {
    res.render('profilesetup', { title: 'Create an Account' });
});

app.post('/profile', (req, res) => {
    const { username, password, securityQuestion, securityAnswer } = req.body;

    // Simple validation
    if (!username || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).render('profilesetup', { title: 'Create an Account', error: 'All fields are required.' });
    }

    // Save user data
    const userData = {
        username,
        password,
        securityQuestion,
        securityAnswer
    };

    fs.writeFileSync(path.join(dataPath, 'user.json'), JSON.stringify(userData, null, 2));

    res.redirect('/');
});

// Forgot Password Route (GET and POST)
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: 'Forgot Password' });
});

app.post('/forgot-password', (req, res) => {
    const { username, securityAnswer } = req.body;
    const userData = loadUserData();

    // Validate username and answer
    if (userData.username === username && userData.securityAnswer === securityAnswer) {
        res.render('reset-password', { title: 'Reset Password' });
    } else {
        res.render('forgot-password', { title: 'Forgot Password', error: 'Invalid username or security answer.' });
    }
});
app.post('/api/bookmark', (req, res) => {
    const { activityId, action } = req.body;
    const userData = loadUserData();

    // Ensure the user is logged in
    if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the user in the JSON file
    const username = req.session.user.username;
    if (!userData.username || userData.username !== username) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Ensure the user's bookmark list exists
    if (!userData.bookmarkedActivities) {
        userData.bookmarkedActivities = [];
    }

    // Add or remove bookmarks based on action
    if (action === 'add') {
        if (!userData.bookmarkedActivities.includes(activityId)) {
            userData.bookmarkedActivities.push(activityId);
        }
    } else if (action === 'remove') {
        userData.bookmarkedActivities = userData.bookmarkedActivities.filter(id => id !== activityId);
    } else {
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Save updated user data
    saveUserData(userData);

    res.status(200).json({ success: true, bookmarkedActivities: userData.bookmarkedActivities });
});

    // Save updated user data
    saveUserData(userData);

    res.status(200).json({ success: true, bookmarkedActivities: userData.bookmarkedActivities });
});
// home route so only signed in users can access it
app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to sign-in if not logged in
    }

    res.render('home', { title: 'Home', username: req.session.user.username });
});


// Load activity data with error handling
function loadActivityData() {
    try {
        const data = fs.readFileSync(path.join(dataPath, 'activities.json'), 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading activities.json:', error);
        return []; // Return an empty array if loading fails
    }
}

// Explore Page Route
app.get('/explore', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to sign-in if not logged in
    }

    const activitiesData = loadActivityData(); // Load all activities
    const activities = activitiesData.activities; // Extract activities array

    console.log("Final Activities Sent to Handlebars:", activities); // Debugging output

    res.render('explore', { 
        title: 'Explore Activities', 
        username: req.session.user.username, 
        activities // Pass activities directly
    });
});




// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
