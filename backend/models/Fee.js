const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  schoolClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolClass'
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['PAID', 'PENDING', 'OVERDUE', 'PAID_PENDING'],
    default: 'PENDING'
  },
  paymentDate: {
    type: Date
  },
  submittedAmount: {
    type: Number
  },
  submittedDate: {
    type: Date
  },
  paymentSlipPath: {
    type: String
  }
}, {
  timestamps: true
});

feeSchema.index({ student: 1, subject: 1, schoolClass: 1, status: 1 });

module.exports = mongoose.model('Fee', feeSchema);
