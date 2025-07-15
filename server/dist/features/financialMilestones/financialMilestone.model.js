"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const financialMilestoneSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    targetAmount: {
        type: Number,
        required: true,
    },
    targetDate: {
        type: Date,
    },
    currentAmount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const FinancialMilestone = (0, mongoose_1.model)('FinancialMilestone', financialMilestoneSchema);
exports.default = FinancialMilestone;
