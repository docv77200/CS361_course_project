const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');

const app = express();

// Define absolute paths for directories
const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');
const dataPath = path.join(__dirname, 'data');

// Handlebars setup
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('views', viewsPath);  // Explicit views directory
app.set('view engine', 'handlebars');

// Middleware
app.use(express.static(publicPath));        // Static files (CSS, JS, images)
app.use(express.json());                    // JSON requests
app.use(express.urlencoded({ extended: true }));  // Form submissions

// Helper function to read mock JSON data (replace with database calls as needed)
function loadData(fileName) {
    const data = fs.readFileSync(path.join(dataPath, fileName), 'utf-8');
    return JSON.parse(data);
}

// Routes

// Home Page
app.get('/', (req, res) => {
    console.log('Rendering home page');  // Debug log
    res.render('home', { title: 'Home' });
});

// Explore Page - Fetch activities from mock data
app.get('/explore', (req, res) => {
    const activities = loadData('activities.json');
    res.render('explore', { title: 'Explore Activities', activities });
});

// Activity Details Page
app.get('/activity/:id', (req, res) => {
    const activities = loadData('activities.json');
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
    const { name, hometown, interests } = req.body;

    // Simple validation
    if (!name || !hometown || !interests) {
        return res.status(400).render('profile', { title: 'Profile Setup', error: 'All fields are required.' });
    }

    // Save mock data (can replace with a database save later)
    const profileData = { name, hometown, interests: interests.split(',').map(i => i.trim()) };
    fs.writeFileSync(path.join(dataPath, 'user.json'), JSON.stringify(profileData, null, 2));

    res.redirect('/explore');
});

// Sign-in Page
app.get('/signin', (req, res) => {
    res.render('signin', { title: 'Sign In' });
});

// API Route to Bookmark an Activity
app.post('/api/bookmark', (req, res) => {
    const { activityId } = req.body;

    if (!activityId) {
        return res.status(400).json({ error: 'Activity ID is required.' });
    }

    console.log(`Activity ${activityId} bookmarked.`);
    res.status(200).json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Mock functions (replace with real data fetching logic)
function getActivityById(id) {
    const activities = loadData('activities.json');
    return activities.find(activity => activity.id === id);
}

function getUserProfile() {
    return loadData('user.json');
}
