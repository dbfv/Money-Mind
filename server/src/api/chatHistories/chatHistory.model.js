const { Schema, model } = require('mongoose');

const chatHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
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

const ChatHistory = model('ChatHistory', chatHistorySchema);
module.exports = ChatHistory;