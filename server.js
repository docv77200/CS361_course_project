const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const axios = require('axios');  // Import axios for HTTP requests

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

// Load activity data (for displaying all activities)
function loadActivityData() {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataPath, 'activities.json'), 'utf-8')).activities;
    } catch (error) {
        console.error('Error loading activities.json:', error);
        return [];
    }
}

// Route: Explore Page (Fetch recommendations from microservice)
app.get('/explore', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    const userData = loadUserData();
    const { city, interests } = userData;
    const activities = loadActivityData(); // Load all activities

    try {
        const response = await axios.post('http://127.0.0.1:6767/recommendations', {
            location: city, 
            activity_type: interests.join(", "),  // Convert list to a comma-separated string
            budget: "$50"  // Default budget (modify based on user preference)
        });

        const recommendedActivities = response.data;

        // Prioritize recommended activities at the top
        const sortedActivities = [...recommendedActivities, ...activities.filter(act => !recommendedActivities.some(r => r.name === act.name))];

        res.render('explore', { 
            title: 'Explore Activities', 
            user: req.session.user, 
            activities: sortedActivities 
        });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.render('explore', { 
            title: 'Explore Activities', 
            user: req.session.user, 
            activities 
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
