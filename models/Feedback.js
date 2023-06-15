const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  deviceName: {
    type: String,
    required: true,
    trim: true,
  },
  androidVersion: {
    type: String,
    required: true,
    trim: true,
  },
  appVersion: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
