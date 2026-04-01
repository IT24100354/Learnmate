const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  type: {
    type: String,
    enum: ['SYSTEM', 'MANUAL'],
    default: 'SYSTEM'
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetRole: {
    type: String
  },
  targetClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolClass'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  broadcastKey: {
    type: String
  },
  fileName: {
    type: String
  },
  originalFileName: {
    type: String
  },
  filePath: {
    type: String
  },
  fileType: {
    type: String
  },
  fileSize: {
    type: Number
  }
}, {
  timestamps: true
});

notificationSchema.index({ targetUser: 1, createdAt: -1 });
notificationSchema.index({ createdBy: 1, createdAt: -1 });
notificationSchema.index({ broadcastKey: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
