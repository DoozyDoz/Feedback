const mongoose = require('mongoose')

const SignupRequestSchema = new mongoose.Schema(
  {
    approved: {
      type: String,
      enum: ['approved', 'declined', 'pending'],
      default: 'pending',
    },
    sentBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('SignupRequest', SignupRequestSchema)
