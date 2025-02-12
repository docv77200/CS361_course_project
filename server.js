const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();

const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');
const dataPath = path.join(__dirname, 'data');

// Session setup
app.use(session({
    secret: 'your-secret-key',  // Change this to a secure secret in production
    resave: false,
    saveUninitialized: true
}));

// Handlebars setup
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('views', viewsPath);
app.set('view engine', 'handlebars');

// Middleware
app.use(express.static(publicPath)); // Serve static files (JS, CSS, Images)
app.use(express.json()); // Enable JSON body parsing
app.use(express.urlencoded({ extended: true })); // Enable URL-encoded form parsing

// Load user data
function loadUserData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'user.json'), 'utf-8'));
    } catch (error) {
        console.error('Error loading user.json:', error);
        return {}; // Return empty object if loading fails
    }
}

// Save user data
function saveUserData(data) {
    fs.writeFileSync(path.join(dataPath, 'user.json'), JSON.stringify(data, null, 2));
}

// Load activity data
function loadActivityData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'activities.json'), 'utf-8')).activities;
    } catch (error) {
        console.error('Error loading activities.json:', error);
        return []; // Return empty array if loading fails
    }
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

    if (userData.username === username && userData.password === password) {
        req.session.user = { username: userData.username };

        // Redirect to home page upon successful login
        return res.redirect('/home');
    }

    res.render('signin', { title: 'Sign In', error: 'Invalid username or password.' });
});

// Profile Setup Page (GET and POST)
app.get('/profile', (req, res) => {
    res.render('profilesetup', { title: 'Create an Account' });
});

app.post('/profile', (req, res) => {
    const { username, password, securityQuestion, securityAnswer } = req.body;

    if (!username || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).render('profilesetup', { title: 'Create an Account', error: 'All fields are required.' });
    }

    // Save user data
    const userData = {
        username,
        password,
        securityQuestion,
        securityAnswer,
        bookmarkedActivities: [] // Initialize bookmarks for the user
    };

    saveUserData(userData);

    res.redirect('/');
});

// Forgot Password Route (GET and POST)
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: 'Forgot Password' });
});

app.post('/forgot-password', (req, res) => {
    const { username, securityAnswer } = req.body;
    const userData = loadUserData();

    if (userData.username === username && userData.securityAnswer === securityAnswer) {
        res.render('reset-password', { title: 'Reset Password' });
    } else {
        res.render('forgot-password', { title: 'Forgot Password', error: 'Invalid username or security answer.' });
    }
});

// Home Route - Only signed-in users can access it
app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to sign-in if not logged in
    }

    res.render('home', { title: 'Home', username: req.session.user.username });
});

// Explore Page Route - Display all activities
app.get('/explore', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to sign-in if not logged in
    }

    const activities = loadActivityData(); // Load all activities
    res.render('explore', { 
        title: 'Explore Activities', 
        username: req.session.user.username, 
        activities 
    });
});

// API Route: Bookmark an Activity
app.post('/api/bookmark', (req, res) => {
    const { activityId, action } = req.body;
    const userData = loadUserData();

    if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const username = req.session.user.username;

    if (!userData.username || userData.username !== username) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!userData.bookmarkedActivities) {
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

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
