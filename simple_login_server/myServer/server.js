const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors()); // This will allow all origins. For production, configure it to allow only specific origins.

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle POST requests to "/login"
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`username: ${username}, password: ${password}`);

    // Simple check (in real applications, verify credentials securely)
    if (username === 'user' && password === 'pass') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('crt.pem')
  }, app)
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
});
// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });