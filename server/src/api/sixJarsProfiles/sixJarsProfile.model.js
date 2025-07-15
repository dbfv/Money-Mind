const { Schema, model } = require('mongoose');

const sixJarsProfileSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Profile name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    isPreset: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    jarPercentages: {
        necessities: {
            type: Number,
            required: [true, 'Necessities percentage is required'],
            min: [0, 'Necessities percentage cannot be negative'],
            max: [100, 'Necessities percentage cannot exceed 100%'],
        },
        play: {
            type: Number,
            required: [true, 'Play percentage is required'],
            min: [0, 'Play percentage cannot be negative'],
            max: [100, 'Play percentage cannot exceed 100%'],
        },
        education: {
            type: Number,
            required: [true, 'Education percentage is required'],
            min: [0, 'Education percentage cannot be negative'],
            max: [100, 'Education percentage cannot exceed 100%'],
        },
        financialFreedom: {
            type: Number,
            required: [true, 'Financial freedom percentage is required'],
            min: [0, 'Financial freedom percentage cannot be negative'],
            max: [100, 'Financial freedom percentage cannot exceed 100%'],
        },
        longTermSavings: {
            type: Number,
            required: [true, 'Long-term savings percentage is required'],
            min: [0, 'Long-term savings percentage cannot be negative'],
            max: [100, 'Long-term savings percentage cannot exceed 100%'],
        },
        give: {
            type: Number,
            required: [true, 'Give percentage is required'],
            min: [0, 'Give percentage cannot be negative'],
            max: [100, 'Give percentage cannot exceed 100%'],
        },
    },
}, {
    timestamps: true,
});

// Validate that percentages sum to 100%
sixJarsProfileSchema.pre('save', function (next) {
    const percentages = this.jarPercentages;
    const total = percentages.necessities + percentages.play + percentages.education +
        percentages.financialFreedom + percentages.longTermSavings + percentages.give;

    if (Math.abs(total - 100) > 0.01) {
        return next(new Error('Jar percentages must sum to 100%'));
    }
    next();
});

const SixJarsProfile = model('SixJarsProfile', sixJarsProfileSchema);
module.exports = SixJarsProfile; 