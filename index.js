import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/pages')]);
app.use(express.urlencoded({ extended: true }));

const port = 3000;
const users = [{ username: "admin", password: "12345678" }];
const blogPost = [
    { title: 'First Blog', content: 'This is the first blog content.', author: 'anonymous', date: '20/01/2003'},
    { title: 'Second Blog', content: 'This is the second blog content.', author: 'anonymous', date: '20/01/2003'},
    { title: 'Secret Blog 27', content: 'This is 27.', author: 'anonymous', date: '17/03/2024'},
];

let currentUser = null; // User session
let isVisible = false; // State variable to toggle content in blog page

// Middleware to handle session data (temporary)
app.use((req, res, next) => {
    res.locals.currentUser = currentUser;
    res.locals.isVisible = isVisible; // Make isVisible available in views
    res.set('Cache-Control', 'no-store'); //fixing the bug of when
    next();
});

app.get('/', (req, res) => {
    res.render('home_page', { currentUser });
});

app.get('/profile', (req, res) => {
    res.render('user_inf', { currentUser });
});

app.get('/aboutus', (req, res) => {
    res.render('aboutus'); // Render the aboutus.ejs file
});

app.get('/dashboard', (req, res) => {
    let blogsToShow = blogPost; // Show all blogs by default
    res.render('blog_page', { currentUser, blogPost: blogsToShow, isVisible });
});

app.get('/blog', (req, res) => {
    let blogsToShow = blogPost; // Show all blogs by default
    
    if (currentUser && currentUser.username !== 'Guest') {
        // Filter blogs if the user is logged in and is not a guest
        blogsToShow = blogPost.filter(blog => blog.author === currentUser.username);
    }
    // Render the blog page with the correct blogs (all or user-specific)
    res.render('blog_page', { currentUser, blogPost: blogsToShow, isVisible });
});

app.get('/check_username', (req, res) => {
    const { username } = req.query;

    // Check if the username is already taken
    const isUsernameTaken = users.some(user => user.username === username);

    // Respond with availability status
    res.json({ available: !isUsernameTaken });
});

app.get('/login', (req, res) => {
    res.render('log_in', { response: null });
});

app.get('/signup', (req, res) => {
    res.render('sign_up', { response: null });
});

// Route for guest login
app.get('/guest_login', (req, res) => {
    currentUser = { username: "Guest" };
    res.redirect('/blog'); //****?^
});

app.get('/showBlog/:index', (req, res) => {
    const index = req.params.index;
    if (blogPost[index]) {
        res.json(blogPost[index]);
    } else {
        res.status(404).json({ error: 'Blog not found' });
    }
});

app.post('/toggle', (req, res) => {
    isVisible = !isVisible;
    res.redirect('/dashboard');
});

app.post('/blog_login', (req, res) => {
    const { username, password } = req.body;
    const userFound = users.find(user => user.username === username && user.password === password);

    if (userFound) {
        currentUser = userFound;
        res.redirect('/dashboard');
    } else {
        res.render('log_in', { response: 'Login failed. Please check your credentials.' });
    }
});

app.post('/blog_signin', (req, res) => {
    const { username, password, check } = req.body;

    // Check for empty fields
    if (!username || !password || !check) {
        return res.render('sign_up', { response: 'All fields must be filled out.' });
    }

    // Username validation: no Turkish characters, no special characters like '@'
    const usernameRegex = /^[A-Za-z0-9]+$/; // Only allows alphanumeric characters
    if (!usernameRegex.test(username)) {
        return res.render('sign_up', { response: 'Username must only consist of letters and numbers; special characters are not allowed.' });
    }

    // Check if the username is already taken
    const isUsernameTaken = users.some(user => user.username === username);
    if (isUsernameTaken) {
        return res.render('sign_up', { response: 'This username is already taken.' });
    }

    // Password validation: no numbers allowed
    const passwordRegex = /^[A-Za-z0-9]+$/; // Only allows letters
    if (!passwordRegex.test(password)) {
        return res.render('sign_up', { response: 'Password must only consist of letters; special characters are not allowed.' });
    }

    // Validate password length
    if (password.length < 8) {
        return res.render('sign_up', { response: 'Your password must be at least 8 characters long.' });
    }

    // Check if passwords match
    if (password !== check) {
        return res.render('sign_up', { response: 'Passwords do not match. Please check.' });
    }

    // If validation passes, proceed to register the user
    users.push({ username, password });
    currentUser = { username };
    res.redirect('/dashboard');
});

app.post('/addBlog', (req, res) => {
    const { title, content } = req.body;
    const currentAuthor = currentUser ? currentUser.username : 'Guest';
    const date = new Date().toLocaleDateString();

    blogPost.push({ title, content, author: currentAuthor, date });

    res.redirect('/dashboard');
});



app.post('/deleteBlog/:index', (req, res) => {
    const blogIndex = parseInt(req.params.index); // Get blog index from URL and convert to a number
    // Ensure the current user is the author of the blog before deletion
    if (blogPost[blogIndex] && blogPost[blogIndex].author === currentUser.username) {
        blogPost.splice(blogIndex, 1); // Remove the blog post from the array
        res.redirect('/dashboard'); // Redirect after deletion
    } else {
        res.status(404).send('Blog not found or you do not have permission to delete it.');
    }
});

app.put('/updateUsername', (req, res) => {
    const { newUsername } = req.body; // Get the new username from the request body

    if (currentUser) {
        // Check if the new username is already taken
        const isUsernameTaken = users.some(user => user.username === newUsername); // Use newUsername instead of username

        if (isUsernameTaken) {
            // If taken, respond with a message indicating the username is already taken
            return res.status(400).json({ success: false, message: 'This username is already taken.' });
        }

        // Update the current user's username
        currentUser.username = newUsername;
        return res.json({ success: true, message: 'Username successfully updated.' });
    } else {
        // If the user is not logged in, send an error response
        return res.status(401).json({ success: false, message: 'User not logged in.' });
    }
});



app.put('/updatePassword', (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Check if the user is authenticated
    if (!currentUser) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Find the user in the users array
    const user = users.find(user => user.username === currentUser.username);

    // Check if the old password matches the user's stored password
    if (!user || oldPassword !== user.password) { // Compare against the password in users array
        return res.status(400).json({ success: false, message: 'Old password is incorrect' });
    }

    // Validate new password length
    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    // Check if the new password and confirmation match
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'New password and confirmation do not match' });
    }

    // Update the password in the users array
    user.password = newPassword; // Ensure to hash the password before storing
    return res.json({ success: true, message: 'Password updated successfully' });
});

app.post('/deleteUser', (req, res) => {
    if (!currentUser) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Find the index of the current user in the users array
    const userIndex = users.findIndex(user => user.username === currentUser.username);

    if (userIndex !== -1) {
        // Remove the user from the users array
        users.splice(userIndex, 1);
        // Clear currentUser session
        currentUser = null;
        // Respond with success
        res.render('home_page', { currentUser });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

app.get('/logout', (req, res) => {
    currentUser = null;
    isVisible = false;
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
