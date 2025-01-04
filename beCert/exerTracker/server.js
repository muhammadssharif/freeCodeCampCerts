const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exercise-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public')); // optional if serving static pages

// Optional front-end
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

/**
 * 1. POST /api/users
 *    Creates a new user given a 'username'
 *    Response: { username, _id }
 */
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;

    // Create a new User document
    const newUser = new User({ username });
    const savedUser = await newUser.save();

    res.json({
      username: savedUser.username,
      _id: savedUser._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * 2. GET /api/users
 *    Returns an array of all users
 *    Example: [ { username, _id }, ... ]
 */
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * 3. POST /api/users/:_id/exercises
 *    Add an exercise to a user’s log
 *    Body: { description, duration, date (optional) }
 *    If no date provided, default to current date
 *    Response format:
 *    {
 *      username,
 *      description,
 *      duration,
 *      date: "Mon Jan 01 1990",
 *      _id
 *    }
 */
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Use provided date or default to current date
    let exerciseDate = date ? new Date(date) : new Date();
    if (isNaN(exerciseDate)) return res.json({ error: 'Invalid Date' });

    // Create exercise object
    const exercise = {
      description,
      duration: parseInt(duration),
      date: exerciseDate
    };

    user.exercises.push(exercise);
    await user.save();

    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * 4. GET /api/users/:_id/logs
 *    Retrieves a user’s exercise log
 *    Query params: from, to, limit
 *    Response example:
 *    {
 *      username,
 *      count,
 *      _id,
 *      log: [{ description, duration, date }, ...]
 *    }
 */
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Convert from/to to Dates (if provided)
    let fromDate = from ? new Date(from) : null;
    let toDate = to ? new Date(to) : null;

    // Filter exercises in memory or use Mongoose query
    let filtered = user.exercises;

    if (fromDate instanceof Date && !isNaN(fromDate.getTime())) {
      filtered = filtered.filter((exercise) => exercise.date >= fromDate);
    }
    if (toDate instanceof Date && !isNaN(toDate.getTime())) {
      filtered = filtered.filter((exercise) => exercise.date <= toDate);
    }

    // Sort by date ascending (optional)
    filtered.sort((a, b) => a.date - b.date);

    // Limit (if provided)
    if (limit) {
      filtered = filtered.slice(0, parseInt(limit));
    }

    // Map the exercises to the output format
    const log = filtered.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));

    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Exercise Tracker is listening on port ${port}`);
});
