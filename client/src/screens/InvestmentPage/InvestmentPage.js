import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../components/ToastProvider';
import { ENDPOINTS } from '../../config/api';
import PieChart from './components/PieChart';

const NewInvestmentPage = () => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [suggestion, setSuggestion] = useState(null);
    const [hasNoTransactions, setHasNoTransactions] = useState(false);

    // Auto-load investment suggestion on page load
    useEffect(() => {
        handleGetSuggestion();
    }, []);

    const handleGetSuggestion = async () => {
        setIsLoading(true);
        setHasNoTransactions(false);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/api/ai/investment-suggestion`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                // Check if it's a "no transactions" error
                if (errorData.message && errorData.message.includes('No income data found')) {
                    setHasNoTransactions(true);
                    return;
                }
                
                throw new Error(errorData.message || 'Failed to get investment suggestion');
            }

            const data = await response.json();
            setSuggestion(data.data);
        } catch (error) {
            console.error('Error getting investment suggestion:', error);
            showToast(error.message, { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Color palette for assets
    const getAssetColor = (index) => {
        const colors = [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Yellow/Gold
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#06B6D4', // Cyan
            '#F97316', // Orange
            '#84CC16'  // Lime
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <motion.div
                className="w-full px-8 py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            AI Investment Advisor
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get personalized investment suggestions based on your income and risk profile
                        </p>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg bg-blue-100 text-blue-800">
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing Your Financial Profile...
                            </div>
                        </div>
                    )}

                    {/* Retry Button (only show if there's an error and not loading) */}
                    {!isLoading && !suggestion && !hasNoTransactions && (
                        <div className="text-center mb-8">
                            <motion.button
                                onClick={handleGetSuggestion}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                            >
                                <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Retry Analysis
                            </motion.button>
                        </div>
                    )}

                    {/* Results Section */}
                    {suggestion && (
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full px-6"
                            >
                            {/* Left Column - Investment Plan Card */}
                            <div className="bg-white rounded-xl shadow-lg p-10 w-full min-h-full">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Investment Plan</h2>
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600">Average Monthly Income</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {formatCurrency(suggestion.averageMonthlyIncome)}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600">Suggested Monthly Investment</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(suggestion.suggestedInvestableIncome)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                (12% of your income)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Strategy Summary */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Strategy</h3>
                                    <p className="text-gray-700">{suggestion.summary}</p>
                                </div>
                            </div>

                            {/* Right Column - Asset Allocation with Pie Chart */}
                            <div className="bg-white rounded-xl shadow-lg p-10 w-full min-h-full">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Asset Allocation</h3>
                                
                                {/* Pie Chart */}
                                <div className="flex justify-center mb-6">
                                    <PieChart data={suggestion.assetAllocation} />
                                </div>

                                {/* Asset Details */}
                                <div className="space-y-3">
                                    {suggestion.assetAllocation.map((asset, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <div 
                                                    className="w-4 h-4 rounded-full mr-3"
                                                    style={{ backgroundColor: getAssetColor(index) }}
                                                />
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-sm">
                                                        {asset.assetType}
                                                    </h4>
                                                    <p className="text-xs text-gray-600">
                                                        {formatCurrency(asset.amount)}/month
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">
                                                    {asset.percentage}%
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Asset Reasoning */}
                                <div className="mt-6 space-y-3">
                                    <h4 className="font-semibold text-gray-900">Why This Allocation?</h4>
                                    {suggestion.assetAllocation.map((asset, index) => (
                                        <div key={index} className="text-sm">
                                            <span className="font-medium" style={{ color: getAssetColor(index) }}>
                                                {asset.assetType}:
                                            </span>
                                            <span className="text-gray-700 ml-2">{asset.reasoning}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </motion.div>

                            {/* Disclaimer */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                            >
                                <div className="flex">
                                    <svg className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h3 className="text-sm font-medium text-yellow-800">Important Disclaimer</h3>
                                        <p className="text-sm text-yellow-700 mt-1">{suggestion.disclaimer}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* No Transactions State */}
                    {hasNoTransactions && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-xl shadow-lg p-8 text-center"
                        >
                            <div className="mb-6">
                                <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Income Data Found</h3>
                                <p className="text-gray-600 mb-6">
                                    To generate personalized investment suggestions, we need to analyze your income history. 
                                    Please add some income transactions first.
                                </p>
                            </div>
                            
                            <div className="bg-blue-50 rounded-lg p-6 mb-6">
                                <h4 className="font-semibold text-blue-900 mb-3">Getting Started:</h4>
                                <div className="text-left space-y-2 text-blue-800">
                                    <div className="flex items-center">
                                        <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">1</span>
                                        Go to the Journal page
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">2</span>
                                        Add your income transactions (salary, freelance, etc.)
                                    </div>
                                    <div className="flex items-center">
                                        <span className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">3</span>
                                        Return here for your personalized investment plan
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <motion.button
                                    onClick={() => window.location.href = '/journal'}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                >
                                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Income Transactions
                                </motion.button>
                                
                                <motion.button
                                    onClick={handleGetSuggestion}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-all duration-200"
                                >
                                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Check Again
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Info Section - only show when not loading and no suggestion and no error */}
                    {!isLoading && !suggestion && !hasNoTransactions && (
                        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                        <span className="text-blue-600 font-bold">1</span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Analyze Income</h4>
                                    <p className="text-gray-600 text-sm">We analyze your last 6 months of income transactions</p>
                                </div>
                                <div className="text-center">
                                    <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                        <span className="text-green-600 font-bold">2</span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Calculate Amount</h4>
                                    <p className="text-gray-600 text-sm">Suggest 12% of your monthly income for investment</p>
                                </div>
                                <div className="text-center">
                                    <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                        <span className="text-purple-600 font-bold">3</span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">AI Allocation</h4>
                                    <p className="text-gray-600 text-sm">AI creates a personalized asset allocation plan</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default NewInvestmentPage;