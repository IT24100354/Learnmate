const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolClass',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  passMark: {
    type: Number,
    required: true
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  grade: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  filePath: {
    type: String
  }
}, {
  timestamps: true
});

examSchema.index({ schoolClass: 1, subject: 1, date: 1 });

module.exports = mongoose.model('Exam', examSchema);
