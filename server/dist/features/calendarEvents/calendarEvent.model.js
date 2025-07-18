"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const calendarEventSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const CalendarEvent = (0, mongoose_1.model)('CalendarEvent', calendarEventSchema);
exports.default = CalendarEvent;
