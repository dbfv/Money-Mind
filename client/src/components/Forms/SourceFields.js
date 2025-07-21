import React from 'react';
import Dropdown from '../Dropdown';

const SourceFields = ({ values = {}, onChange }) => {
    const sourceTypeOptions = [
        { value: 'cash', label: 'Cash 💵' },
        { value: 'bank', label: 'Bank Account 🏦' },
        { value: 'credit', label: 'Credit Card 💳' },
        { value: 'investment', label: 'Investment Account 📈' },
        { value: 'other', label: 'Other 🔄' }
    ];

    const frequencyOptions = [
        { value: 'daily', label: 'Daily 📅' },
        { value: 'weekly', label: 'Weekly 📆' },
        { value: 'monthly', label: 'Monthly 📅' },
        { value: 'yearly', label: 'Yearly 📊' }
    ];

    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Name *
                </label>
                <input
                    type="text"
                    name="sourceName"
                    value={values.sourceName || ''}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter source name"
                />
            </div>

            <Dropdown
                label="Source Type"
                name="sourceType"
                value={values.sourceType || ''}
                onChange={onChange}
                options={sourceTypeOptions}
                placeholder="Select type"
                required
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Balance
                </label>
                <input
                    type="number"
                    name="balance"
                    value={values.balance || ''}
                    onChange={onChange}
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
                    value={values.interestRate || ''}
                    onChange={onChange}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Enter interest rate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
            </div>

            <Dropdown
                label="Payment Frequency"
                name="paymentFrequency"
                value={values.paymentFrequency || ''}
                onChange={onChange}
                options={frequencyOptions}
                placeholder="Select frequency"
            />
        </>
    );
};

export default SourceFields;
