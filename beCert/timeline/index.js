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

app.get('/api', (req, res) => {
  const date = new Date();
  res.json({ unix: date.getTime(), utc: date.toUTCString() });
});

// API endpoint
app.get('/api/:date?', (req, res) => {
  let dateParam = req.params.date;
  let date;

  // If no dateParam or it's an empty string, use the current date
  if (!dateParam || dateParam.trim() === '') {
    date = new Date();
  } else if (!isNaN(dateParam)) {
    // If it's numeric, parse as a timestamp
    date = new Date(parseInt(dateParam));
  } else {
    // Otherwise, parse as a string
    date = new Date(dateParam);
  }

  // Check for invalid date
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
