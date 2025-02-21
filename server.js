const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();

// Define paths
const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');
const dataPath = path.join(__dirname, 'data');

// Session setup
app.use(session({
    secret: 'your-secret-key', // Change this to a secure secret in production
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

// Helper functions to load and save user data
function loadUserData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'user.json'), 'utf-8'));
    } catch (error) {
        console.error('Error loading user.json:', error);
        return {}; // Return empty object if file is missing or corrupt
    }
}

function saveUserData(data) {
    fs.writeFileSync(path.join(dataPath, 'user.json'), JSON.stringify(data, null, 2));
}

function loadActivityData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'activities.json'), 'utf-8')).activities;
    } catch (error) {
        console.error('Error loading activities.json:', error);
        return [];
    }
}

// ---------------------- Routes ---------------------- //

// Default route - Sign-in page
app.get('/', (req, res) => {
    res.render('signin', { title: 'Sign In' });
});

// Handle Sign-in
app.post('/signin', (req, res) => {
    const { username, password } = req.body;
    const userData = loadUserData();

    if (userData.username === username && userData.password === password) {
        req.session.user = { username: userData.username };
        return res.redirect('/home');
    }

    res.render('signin', { title: 'Sign In', error: 'Invalid username or password.' });
});

// Profile Setup (GET)
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('profilesetup', { title: 'Create an Account', user: req.session.user });
});

// Profile Setup (POST)
app.post('/profile', (req, res) => {
    const { username, password, securityQuestion, securityAnswer, interests } = req.body;
    let userInterests = Array.isArray(interests) ? interests : [interests];

    if (!username || !password || !securityQuestion || !securityAnswer || !userInterests) {
        return res.status(400).render('profilesetup', { title: 'Create an Account', error: 'All fields are required.' });
    }

    const userData = {
        username,
        password,
        securityQuestion,
        securityAnswer,
        interests: userInterests,
        bookmarkedActivities: []
    };

    saveUserData(userData);
    res.redirect('/');
});

// Forgot Password (GET)
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: 'Forgot Password' });
});

// Forgot Password (POST)
app.post('/forgot-password', (req, res) => {
    const { username, securityAnswer } = req.body;
    const userData = loadUserData();

    if (userData.username === username && userData.securityAnswer === securityAnswer) {
        res.render('reset-password', { title: 'Reset Password' });
    } else {
        res.render('forgot-password', { title: 'Forgot Password', error: 'Invalid username or security answer.' });
    }
});

// Home Page - Requires Login
app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('home', { title: 'Home', user: req.session.user });
});

// Explore Page - Display all activities
app.get('/explore', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    const activities = loadActivityData();
    res.render('explore', { title: 'Explore Activities', user: req.session.user, activities });
});

// Bookmark an Activity (POST)
app.post('/api/bookmark', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const { activityId, action } = req.body;
    const userData = loadUserData();
    const username = req.session.user.username;

    if (!userData.username || userData.username !== username) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!Array.isArray(userData.bookmarkedActivities)) {
        userData.bookmarkedActivities = [];
    }

    if (action === 'add') {
        if (!userData.bookmarkedActivities.includes(activityId)) {
            userData.bookmarkedActivities.push(activityId);
        }
    } else if (action === 'remove') {
        userData.bookmarkedActivities = userData.bookmarkedActivities.filter(id => id !== activityId);
    } else {
        return res.status(400).json({ error: 'Invalid action' });
    }

    saveUserData(userData);
    res.status(200).json({ success: true, bookmarkedActivities: userData.bookmarkedActivities });
});

// Get Bookmarked Activities (GET)
app.get('/api/get-bookmarks', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const userData = loadUserData();
    const username = req.session.user.username;

    if (!userData.username || userData.username !== username) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!userData.bookmarkedActivities || userData.bookmarkedActivities.length === 0) {
        return res.status(200).json({ success: true, bookmarkedActivities: [] });
    }

    const allActivities = loadActivityData();
    const bookmarkedActivities = allActivities.filter(activity =>
        userData.bookmarkedActivities.includes(activity.id)
    );

    res.status(200).json({ success: true, bookmarkedActivities });
});

// Logout Route (Optional)
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
