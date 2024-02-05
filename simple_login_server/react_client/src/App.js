import React, { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const loginDetails = { 
      username: username, password: password };

    // Send a POST request
    const response = await fetch('https://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginDetails),
    });

    const data = await response.json(); // Assuming the server responds with JSON
    console.log(data); // Log the response from the server
    alert(data.message);
    // Handle the response (e.g., navigate to another page or show an error message)
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Login Form</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </header>
    </div>
  );
}

export default App;
