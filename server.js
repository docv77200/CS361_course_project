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

// Load user data
function loadUserData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'user.json'), 'utf-8'));
    } catch (error) {
        console.error('Error loading user.json:', error);
        return { username: "", password: "", securityQuestion: "", securityAnswer: "", interests: [], bookmarkedActivities: [] };
    }
}

function saveUserData(data) {
    fs.writeFileSync(path.join(dataPath, 'user.json'), JSON.stringify(data, null, 2));
}

// Load activity data
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

// Profile Page
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('profile', { title: 'Profile', user: req.session.user });
});

// Activity Details Page
app.get('/activity/:id', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    
    const activities = loadActivityData();
    const activity = activities.find(act => act.id === req.params.id);

    if (!activity) {
        return res.status(404).render('error', { title: 'Activity Not Found', message: 'The requested activity does not exist.' });
    }

    res.render('activity', { title: activity.name, user: req.session.user, activity });
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
