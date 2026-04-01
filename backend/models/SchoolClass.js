const mongoose = require('mongoose');

const schoolClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  description: {
    type: String
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('SchoolClass', schoolClassSchema);
