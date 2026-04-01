const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username must be at most 50 characters'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Email should be valid']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  contact: {
    type: String
  },
  role: {
    type: String,
    enum: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  schoolClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolClass'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  children: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  parents: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
