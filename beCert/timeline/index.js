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

app.get('/api/:date?', (req, res) => {
  const { date } = req.params;
  
  let resultDate;
  if (!date || date == '' || date == "") {
    // If date is undefined (i.e. "/api" with no param)
    resultDate = new Date();
  } else if (!isNaN(date)) {
    // If numeric, parse as timestamp
    resultDate = new Date(parseInt(date));
  } else {
    // Otherwise, parse as string
    resultDate = new Date(date);
  }

  // Check for invalid
  if (resultDate.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: resultDate.getTime(),
    utc: resultDate.toUTCString()
  });
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
