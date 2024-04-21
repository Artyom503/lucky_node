// Import required modules
const express = require('express');
const session = require('express-session');
const path = require('path'); // Import the 'path' module
const fs = require('fs'); // Import the 'fs' module

// Create an Express application
const app = express();
const port = 3000;

// Set the path for views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set up session middleware
app.use(session({
  secret: 'b_5#y2L"F4Q8z\n\xec]/',
  resave: false,
  saveUninitialized: true
}));

// Set up middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Hardcoded admin credentials (you should use a more secure method in production)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";

// Function to check if user is logged in
const is_logged_in = (req) => {
    return req.session.username !== undefined;
}

// File path for data storage
const dataFilePath = path.join(__dirname, 'data.json');

// Load data from the data file
let { data1, data2 } = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

// Routes

// Front page route
app.get('/', (req, res) => {
    res.render('index', { data1, data2 });
});

// Admin page route
app.get('/admin', (req, res) => {
    if (!is_logged_in(req)) {
        res.redirect('/login');
    } else {
        res.render('admin', { data1, data2 });
    }
});

// Handle form submission for admin data
app.post('/admin', (req, res) => {
    if (!is_logged_in(req)) {
        // Redirect to login page if not logged in
        res.redirect('/login');
    } else {
        // Process form data
        if (req.body.submit === "data1") {
            data1 = req.body.data1;
        } else if (req.body.submit === "data2") {
            data2 = req.body.data2;
        }

        // Update data in the data file
        fs.writeFileSync(dataFilePath, JSON.stringify({ data1, data2 }));

        // Redirect to the admin page after saving data
        res.redirect('/admin');
    }
});

// Login page route
app.get('/login', (req, res) => {
    res.render('login', { error: '' });
});

// Login form submission route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.username = username;
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});
// Existing code...

// Route to serve data
app.get('/data', (req, res) => {
    res.json({ data1, data2 });
});

// Existing code...


// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
