const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  published: {
    type: Boolean,
    default: false
  },
  comments: {
    type: String
  }
}, {
  timestamps: true
});

markSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);
