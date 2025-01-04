const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json

// Serve an optional front-end page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// In-memory "database" for demonstration
let urlDatabase = [];
let idCounter = 1;

/**
 * Utility function to validate URL using the WHATWG URL API and dns.lookup.
 * Returns a Promise that resolves if valid, rejects if invalid/unresolvable.
 */
function validateUrl(inputUrl) {
  return new Promise((resolve, reject) => {
    let urlObj;
    try {
      // Check format
      urlObj = new URL(inputUrl);
    } catch (err) {
      // Invalid URL format
      return reject(new Error('invalid url'));
    }

    // Remove trailing slash from hostname if present
    const hostname = urlObj.hostname.replace(/\/$/, '');

    // DNS lookup to ensure it's a resolvable domain
    dns.lookup(hostname, (err) => {
      if (err) {
        return reject(new Error('invalid url'));
      }
      return resolve(urlObj.href);
    });
  });
}

/**
 * POST /api/shorturl
 * Expects form data (or JSON) that includes "url" field
 */
app.post('/api/shorturl', async (req, res) => {
  const inputUrl = req.body.url;

  // Validate URL
  try {
    const validUrl = await validateUrl(inputUrl);

    // Check if already stored
    const existingRecord = urlDatabase.find((item) => item.original_url === validUrl);
    if (existingRecord) {
      return res.json({
        original_url: existingRecord.original_url,
        short_url: existingRecord.short_url
      });
    }

    // If not stored, add to "database"
    const newEntry = {
      original_url: validUrl,
      short_url: idCounter++
    };
    urlDatabase.push(newEntry);

    return res.json({
      original_url: newEntry.original_url,
      short_url: newEntry.short_url
    });
  } catch (error) {
    return res.json({ error: error.message });
  }
});

/**
 * GET /api/shorturl/:short_url
 * Redirects user to original URL
 */
app.get('/api/shorturl/:shorturl', (req, res) => {
  const short = parseInt(req.params.shorturl, 10);
  const record = urlDatabase.find((item) => item.short_url === short);

  if (record) {
    return res.redirect(record.original_url);
  } else {
    return res.json({ error: 'No short URL found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`URL Shortener Microservice listening on port ${port}`);
});
