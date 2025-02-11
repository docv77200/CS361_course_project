const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');

const app = express();

const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');
const dataPath = path.join(__dirname, 'data');

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
        return res.redirect('/explore');  // Redirect to explore page upon successful login
    }

    res.render('signin', { title: 'Sign In', error: 'Invalid username or password.' });
});

// Password Reset Page (GET and POST)
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: 'Forgot Password' });
});

app.post('/forgot-password', (req, res) => {
    const { username, securityAnswer } = req.body;
    const userData = loadUserData();

    // Validate security answer
    if (userData.username === username && userData.securityAnswers.includes(securityAnswer)) {
        res.render('reset-password', { title: 'Reset Password' });
    } else {
        res.render('forgot-password', { title: 'Forgot Password', error: 'Invalid username or answer.' });
    }
});
// Profile Setup Page (GET and POST for creating an account)
app.get('/profile', (req, res) => {
    res.render('profilesetup', { title: 'Create an Account' });
});

app.post('/profile', (req, res) => {
    const { username, password, securityAnswers } = req.body;

    // Simple validation
    if (!username || !password || !securityAnswers) {
        return res.status(400).render('profilesetup', { title: 'Create an Account', error: 'All fields are required.' });
    }

    // Save user data (mock saving to JSON file)
    const userData = {
        username,
        password,
        securityAnswers: securityAnswers.split(',').map(answer => answer.trim())
    };

    fs.writeFileSync(path.join(dataPath, 'user.json'), JSON.stringify(userData, null, 2));

    // Redirect to sign-in page after successful account creation
    res.redirect('/');
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
