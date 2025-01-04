const express = require('express');
const path = require('path');
const app = express();

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
    // If the parameter is a valid number, parse it as a timestamp
    date = new Date(parseInt(dateParam));
  } else {
    // Otherwise, parse it as a string date
    date = new Date(dateParam);
  }

  // Validate the date
  if (date.toString() === 'Invalid Date') {
    res.json({ error: 'Invalid Date' });
  } else {
    res.json({
      unix: date.getTime(),
      utc: date.toUTCString(),
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
