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
  description: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income', 'reminder', 'prediction'],
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'],
    default: 'once',
  },
  recurrenceCount: {
    type: Number,
    default: null, // null means infinite recurrence, number means limited recurrence
    min: 1,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  color: {
    type: String,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  source: {
    type: Schema.Types.ObjectId,
    ref: 'Source',
  }
}, {
  timestamps: true,
});

const CalendarEvent = model('CalendarEvent', calendarEventSchema);
module.exports = CalendarEvent;