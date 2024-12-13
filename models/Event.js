const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  reserved: { type: Boolean, default: false },
  reservedBy: { type: String, default: null },
  selecting: { type: Boolean, default: false },
  selectingBy: { type: String, default: null }
});

const CommentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  comments: [CommentSchema],
  seats: [SeatSchema]
});

module.exports = mongoose.model('Event', EventSchema);