const { Schema, model } = require('mongoose');

const financialMilestoneSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
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

const FinancialMilestone = model('FinancialMilestone', financialMilestoneSchema);
module.exports = FinancialMilestone;