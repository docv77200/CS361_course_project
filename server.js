const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');

const app = express();

// Handlebars setup
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Middleware
app.use(express.static('public'));          // Static files (CSS, JS, images)
app.use(express.json());                    // JSON requests
app.use(express.urlencoded({ extended: true }));  // Form submissions

// Helper function to read mock JSON data (replace with database calls as needed)
function loadData(filePath) {
    const data = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
    return JSON.parse(data);
}

// Routes

// Home Page
app.get('/', (req, res) => res.render('home', { title: 'Home' }));

// Explore Page - Fetch activities from mock data
app.get('/explore', (req, res) => {
    const activities = loadData('data/activities.json');
    res.render('explore', { title: 'Explore Activities', activities });
});

// Activity Details Page
app.get('/activity/:id', (req, res) => {
    const activities = loadData('data/activities.json');
    const activity = activities.find(act => act.id === req.params.id);

    if (!activity) {
        return res.status(404).render('error', { title: 'Activity Not Found', message: 'The requested activity does not exist.' });
    }

    res.render('activity', { title: activity.title, activity });
});

// Profile Setup Page (GET and POST for setting up profile)
app.get('/profile', (req, res) => {
    const profile = getUserProfile();
    res.render('profile', { title: 'Profile', profile });
});

app.post('/profile', (req, res) => {
    const { name, email, hometown, interests } = req.body;

    // Simple validation
    if (!name || !email || !hometown || !interests) {
        return res.status(400).render('profile', { title: 'Profile Setup', error: 'All fields are required.' });
    }

    // Save mock data (can replace with a database save later)
    const profileData = { name, email, hometown, interests: interests.split(',').map(i => i.trim()) };
    fs.writeFileSync('data/user.json', JSON.stringify(profileData, null, 2));

    res.redirect('/explore');
});

// Sign-in Page
app.get('/signin', (req, res) => res.render('signin', { title: 'Sign In' }));

// API Route to Bookmark an Activity
app.post('/api/bookmark', (req, res) => {
    const { activityId } = req.body;

    if (!activityId) {
        return res.status(400).json({ error: 'Activity ID is required.' });
    }

    // Simulate bookmarking (replace with database logic later)
    console.log(`Activity ${activityId} bookmarked.`);
    res.status(200).json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Mock functions (replace with real data fetching logic)
function getActivityById(id) {
    const activities = loadData('data/activities.json');
    return activities.find(activity => activity.id === id);
}

function getUserProfile() {
    return loadData('data/user.json');  // Mock user profile from JSON file
}
