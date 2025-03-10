const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const axios = require('axios');

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

// ---------------------- API Routes ---------------------- //

// ✅ **New Route: Get Bookmarked Activities**
app.get('/api/get-bookmarks', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userData = loadUserData();
    const bookmarkedIds = userData.bookmarkedActivities || [];

    const activities = loadActivityData();
    const bookmarkedActivities = activities.filter(act => bookmarkedIds.includes(act.id));

    res.json({ success: true, bookmarkedActivities });
});

// ✅ **Improved: Bookmark/Unbookmark Activity**
app.post('/api/bookmark', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { activityId, action } = req.body;
    const userData = loadUserData();
    const username = req.session.user.username;

    if (!userData.username || userData.username !== username) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!Array.isArray(userData.bookmarkedActivities)) {
        userData.bookmarkedActivities = [];
    }

    const activities = loadActivityData();
    const activity = activities.find(act => act.id === activityId);

    if (!activity) {
        return res.status(404).json({ success: false, error: "Activity not found" });
    }

    let message = "";

    if (action === 'add') {
        if (!userData.bookmarkedActivities.includes(activityId)) {
            userData.bookmarkedActivities.push(activityId);
            message = `"${activity.name}" added to your bookmarks!`;
        } else {
            return res.status(400).json({ success: false, error: "Activity already bookmarked" });
        }
    } else if (action === 'remove') {
        userData.bookmarkedActivities = userData.bookmarkedActivities.filter(id => id !== activityId);
        message = `"${activity.name}" removed from your bookmarks!`;
    } else {
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    saveUserData(userData);

    // Call the Notification Microservice
    try {
        await axios.post('http://127.0.0.1:3000/send-notification', { text: message });
    } catch (error) {
        console.error("❌ Error sending notification:", error.message);
    }

    res.status(200).json({ success: true, message, bookmarkedActivities: userData.bookmarkedActivities });
});

// ✅ **Improved: Notification Microservice Request**
app.post('/api/notify', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: "Message is required" });

    try {
        await axios.post('http://127.0.0.1:3000/send-notification', { text: message });
        res.json({ success: true, message: "Notification sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending notification:", error.message);
        res.status(500).json({ success: false, error: "Failed to send notification" });
    }
});

// ---------------------- Server Startup ---------------------- //

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
