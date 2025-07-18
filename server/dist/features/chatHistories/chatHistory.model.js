"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chatHistorySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    messages: [
        {
            role: {
                type: String,
                required: true,
                enum: ['user', 'ai'],
            },
            content: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true,
});
const ChatHistory = (0, mongoose_1.model)('ChatHistory', chatHistorySchema);
exports.default = ChatHistory;
