const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  borrowedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnedDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed'
  }
}, {
  timestamps: true
});

// Virtual for checking if borrowing is overdue
borrowingSchema.virtual('isOverdue').get(function() {
  if (this.status === 'returned') return false;
  return new Date() > this.dueDate;
});

// Virtual for days remaining
borrowingSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'returned') return 0;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Method to return a book
borrowingSchema.methods.returnBook = function() {
  this.returnedDate = new Date();
  this.status = 'returned';
  return this;
};

// Method to mark as overdue
borrowingSchema.methods.markOverdue = function() {
  if (this.status === 'borrowed' && this.isOverdue) {
    this.status = 'overdue';
  }
  return this;
};

// Ensure virtual fields are serialized
borrowingSchema.set('toJSON', { virtuals: true });

// Index for efficient queries
borrowingSchema.index({ userId: 1, bookId: 1, status: 1 });
borrowingSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Borrowing', borrowingSchema);
