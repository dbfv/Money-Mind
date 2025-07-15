const { Schema, model } = require('mongoose');

const economicAssumptionSchema = new Schema({
    inflationRate: {
        type: Number,
        default: 2.0,
        min: [0, 'Inflation rate cannot be negative'],
        max: [50, 'Inflation rate cannot exceed 50%'],
    },
    bankInterestRate: {
        type: Number,
        default: 1.0,
        min: [0, 'Bank interest rate cannot be negative'],
        max: [20, 'Bank interest rate cannot exceed 20%'],
    },
    marketReturnRate: {
        type: Number,
        default: 7.0,
        min: [0, 'Market return rate cannot be negative'],
        max: [30, 'Market return rate cannot exceed 30%'],
    },
    taxRate: {
        type: Number,
        default: 20.0,
        min: [0, 'Tax rate cannot be negative'],
        max: [50, 'Tax rate cannot exceed 50%'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const EconomicAssumption = model('EconomicAssumption', economicAssumptionSchema);
module.exports = EconomicAssumption; 