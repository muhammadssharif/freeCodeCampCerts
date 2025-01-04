const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files (optional, if you want to serve an index.html from /public or similar)
app.use('/public', express.static(process.cwd() + '/public'));

// Set up multer (using memoryStorage for simplicity)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Landing page (optional)
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Handle the file upload
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  // If no file is uploaded, respond with an error
  if (!req.file) {
    return res.json({ error: 'No file uploaded' });
  }

  // Return the file metadata
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
});

// Start the server
app.listen(port, () => {
  console.log(`File Metadata Microservice is listening on port ${port}`);
});
