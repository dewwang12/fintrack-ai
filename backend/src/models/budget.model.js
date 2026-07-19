const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Budget must belong to a user'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    limitAmount: {
      type: Number,
      required: [true, 'Limit amount is required'],
      min: [1, 'Limit must be at least 1'],
    },
    period: {
      type: String,
      required: [true, 'Period is required'],
      enum: {
        values: ['monthly', 'yearly'],
        message: 'Period must be monthly or yearly',
      },
      default: 'monthly',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce a unique budget rule per category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
