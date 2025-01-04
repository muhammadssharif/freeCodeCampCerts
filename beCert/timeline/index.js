const express = require('express');
const cors = require('cors');    // <-- add this line
const path = require('path');

const app = express();

// Enable CORS so freeCodeCamp can access your endpoint
app.use(cors());

// Middleware to serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API endpoint
app.get('/api/:date?', (req, res) => {
  const dateParam = req.params.date;

  let date;
  if (!dateParam) {
    // If no date parameter, use the current date
    date = new Date();
  } else if (!isNaN(dateParam)) {
    // If it's numeric, parse as a timestamp
    date = new Date(parseInt(dateParam));
  } else {
    // Otherwise, parse as a string
    date = new Date(dateParam);
  }

  // Validate the date
  if (date.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString(),
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
