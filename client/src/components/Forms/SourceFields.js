import React from 'react';

const SourceFields = () => (
    <>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Name *
            </label>
            <input
                type="text"
                name="sourceName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter source name"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Type *
            </label>
            <select
                name="sourceType"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
                <option value="">Select type</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Account</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment Account</option>
                <option value="other">Other</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Balance
            </label>
            <input
                type="number"
                name="balance"
                step="0.01"
                placeholder="Enter initial balance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%)
            </label>
            <input
                type="number"
                name="interestRate"
                step="0.01"
                min="0"
                max="100"
                placeholder="Enter interest rate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency
            </label>
            <select
                name="paymentFrequency"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </select>
        </div>
    </>
);

export default SourceFields;
