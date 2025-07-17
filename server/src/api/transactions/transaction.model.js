const { Schema, model } = require('mongoose');

const transactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Type',
    required: true,
  },
  source: {
    type: Schema.Types.ObjectId,
    ref: 'Source',
    required: true,
  },
}, {
  timestamps: true,
});

const Transaction = model('Transaction', transactionSchema);
module.exports = Transaction;