**Run Server**

`node server.js`


**Send a POST Request**: 
1. `CURL` POST Request

    You can now practice sending POST requests to `http://localhost:3000/login` using tools like Postman, cURL, or writing client-side JavaScript code. Here's an example cURL command:

    ```bash
    curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username": "user", "password": "pass"}'
    ```

2. frontend `index.html`

    `npm install -g http-server` 

    因為 browser's CORS (Cross-Origin Resource Sharing) policy, server 要加上這個可接受不同源

    `npm install cors`

    `vim index.html`

    `http-server`    # trigger **index.html** using node.js






### Setting Up a Simple Login Server with Express in Node.js

Below is a basic example of how you could set up a simple Express server that accepts login POST requests. This example is purely for educational purposes and should not be used as is for production applications.

1. **Install Node.js and Express**: First, ensure you have Node.js installed. Then, create a new directory for your project, navigate into it, and run `npm init -y` to create a `package.json` file. After that, install Express by running `npm install express`.

2. **Create a Simple Express Server**: Create a file named `server.js` and add the following code to set up a basic server that can handle a login POST request.

```javascript
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle POST requests to "/login"
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Simple check (in real applications, verify credentials securely)
    if (username === 'user' && password === 'pass') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

3. **Run Your Server**: In your terminal, run `node server.js` to start the server.

4. **Send a POST Request**: You can now practice sending POST requests to `http://localhost:3000/login` using tools like Postman, cURL, or writing client-side JavaScript code. Here's an example cURL command:

```bash
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username": "user", "password": "pass"}'
```

This setup provides a controlled environment for you to practice sending POST requests and handling login logic without worrying about the complexities of a real-world application.