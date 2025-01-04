const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  exercises: [exerciseSchema]
});

module.exports = mongoose.model('User', userSchema);