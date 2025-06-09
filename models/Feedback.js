const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: { type: String, required: true },
  product: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
