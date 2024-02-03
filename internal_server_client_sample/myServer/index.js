const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const port = 3000;

app.get('/title', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const title = $('title').text();
    res.json({ title });
  } catch (error) {
    res.status(500).send('Error fetching the title');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
