const { Schema, model } = require('mongoose');

const calendarEventSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['bill', 'income', 'reminder', 'predicted_expense'],
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'],
    default: 'once',
  },
  startDate: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

const CalendarEvent = model('CalendarEvent', calendarEventSchema);
module.exports = CalendarEvent;