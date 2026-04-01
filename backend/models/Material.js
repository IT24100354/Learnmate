const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileName: { type: String },
  originalFileName: { type: String },
  filePath: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  schoolClass: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolClass', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);
