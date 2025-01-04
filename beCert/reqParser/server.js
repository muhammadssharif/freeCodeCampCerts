const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Optional: Serve a landing page (views/index.html)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

/**
 * /api/whoami endpoint
 * Returns JSON with IP address, language, and software
 */
app.get('/api/whoami', (req, res) => {
  // For IP address, if behind a proxy (like on Heroku), use:
  // const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const ip = req.ip;
  const language = req.headers['accept-language'];
  const software = req.headers['user-agent'];

  res.json({
    ipaddress: ip,
    language: language,
    software: software
  });
});

// Start server
app.listen(port, () => {
  console.log(`Request Header Parser is listening on port ${port}`);
});
