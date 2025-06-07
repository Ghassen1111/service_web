const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: String,
  product: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
