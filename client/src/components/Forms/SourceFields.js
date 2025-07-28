import React from 'react';
import Dropdown from '../Dropdown';

const SourceFields = ({ values = {}, onChange, disabled = false, errors = {} }) => {
    const sourceTypeOptions = [
        { value: 'Bank Account', label: 'Bank Account 🏦' },
        { value: 'E-Wallet', label: 'E-Wallet 💳' },
        { value: 'Cash', label: 'Cash 💵' },
        { value: 'Other', label: 'Other 🔄' }
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
                    disabled={disabled}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.sourceName ? 'border-red-500' : disabled ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                        }`}
                    placeholder="Enter source name"
                />
                {errors.sourceName && (
                    <p className="text-red-500 text-sm mt-1">{errors.sourceName}</p>
                )}
            </div>

            <Dropdown
                label="Source Type"
                name="sourceType"
                value={values.sourceType || ''}
                onChange={onChange}
                options={sourceTypeOptions}
                placeholder="Select type"
                required
                disabled={disabled}
                error={errors.sourceType}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Balance *
                </label>
                <input
                    type="number"
                    name="balance"
                    value={values.balance || ''}
                    onChange={onChange}
                    step="0.01"
                    min="0"
                    disabled={disabled}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.balance ? 'border-red-500' : disabled ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                        }`}
                    placeholder="Enter initial balance"
                />
                {errors.balance && (
                    <p className="text-red-500 text-sm mt-1">{errors.balance}</p>
                )}
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
                    disabled={disabled}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.interestRate ? 'border-red-500' : disabled ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                        }`}
                    placeholder="Enter interest rate"
                />
                {errors.interestRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>
                )}
            </div>

            <Dropdown
                label="Payment Frequency"
                name="paymentFrequency"
                value={values.paymentFrequency || ''}
                onChange={onChange}
                options={frequencyOptions}
                placeholder="Select frequency"
                disabled={disabled}
                error={errors.paymentFrequency}
            />
        </>
    );
};

export default SourceFields;
