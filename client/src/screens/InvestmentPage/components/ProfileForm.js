import React from 'react';
import { motion } from 'framer-motion';
import Dropdown from '../../../components/Dropdown';

const ProfileForm = ({ profileData, handleInputChange, handleSubmit, isLoading }) => {
    // Dropdown options
    const riskToleranceOptions = [
        { value: 'low', label: 'Low - Safety First' },
        { value: 'medium', label: 'Medium - Balanced Approach' },
        { value: 'high', label: 'High - Growth Focused' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Age
                    </label>
                    <input
                        type="number"
                        name="age"
                        value={profileData.age}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                        placeholder="e.g. 35"
                        required
                        min="18"
                        max="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Income ($)
                    </label>
                    <input
                        type="number"
                        name="income"
                        value={profileData.income}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                        placeholder="e.g. 5000"
                        required
                        min="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Investment Amount ($)
                    </label>
                    <input
                        type="number"
                        name="monthlyInvestment"
                        value={profileData.monthlyInvestment}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                        placeholder="e.g. 500"
                        required
                        min="0"
                    />
                </div>
                <div>
                    <Dropdown
                        label="Risk Tolerance"
                        name="riskTolerance"
                        value={profileData.riskTolerance}
                        onChange={handleInputChange}
                        options={riskToleranceOptions}
                        required
                    />
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Economic Assumptions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Inflation Rate (%)
                        </label>
                        <input
                            type="number"
                            name="assumptions.inflation"
                            value={profileData.assumptions.inflation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            step="0.1"
                            min="0"
                            max="20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Stock Returns (%)
                        </label>
                        <input
                            type="number"
                            name="assumptions.stockReturns"
                            value={profileData.assumptions.stockReturns}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            step="0.1"
                            min="0"
                            max="20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Bond Returns (%)
                        </label>
                        <input
                            type="number"
                            name="assumptions.bondReturns"
                            value={profileData.assumptions.bondReturns}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            step="0.1"
                            min="0"
                            max="15"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Cash Returns (%)
                        </label>
                        <input
                            type="number"
                            name="assumptions.cashReturns"
                            value={profileData.assumptions.cashReturns}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            step="0.1"
                            min="0"
                            max="10"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
                        }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Generating Recommendations...
                        </div>
                    ) : (
                        'Get My Recommendation'
                    )}
                </motion.button>
            </div>
        </form>
    );
};

export default ProfileForm; 