const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => res.render('home', { title: 'Home' }));
app.get('/explore', (req, res) => res.render('explore', { title: 'Explore' }));
app.get('/activity/:id', (req, res) => {
    const activity = getActivityById(req.params.id); // Mock data fetch
    res.render('activity', { title: activity.title, activity });
});
app.get('/signin', (req, res) => res.render('signin', { title: 'Sign In' }));
app.get('/profile', (req, res) => {
    const profile = getUserProfile(); // Mock data fetch
    res.render('profile', { title: 'Profile', profile });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Mock functions (replace with real data fetching logic)
function getActivityById(id) {
    return {
        title: 'Sample Activity',
        description: 'This is a sample activity description.',
        imageUrl: '/images/sample.jpg',
        isBookmarked: false
    };
}

function getUserProfile() {
    return {
        pictureUrl: '/images/profile.jpg',
        name: 'John Doe',
        location: 'Los Angeles, CA',
        interests: 'Hiking, Cooking'
    };
} 