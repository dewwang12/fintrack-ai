const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, 'Description cannot exceed 250 characters'],
    },
    receipt: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true, // Auto-generates createdAt and updatedAt
  }
);

// Compound index for user query isolation sorted by date descending
transactionSchema.index({ user: 1, date: -1 });
// Compound index to optimize analytic reports filtering user's cash types
transactionSchema.index({ user: 1, type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
