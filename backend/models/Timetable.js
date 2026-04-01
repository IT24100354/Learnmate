const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  title: { type: String, required: true },
  description: { type: String },
  day: { type: String, enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String },
  filePath: { type: String }
}, {
  timestamps: true
});

timetableSchema.index({ schoolClass: 1, day: 1 });
timetableSchema.index({ schoolClass: 1, day: 1, subject: 1 });
timetableSchema.index({ teacher: 1, day: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
