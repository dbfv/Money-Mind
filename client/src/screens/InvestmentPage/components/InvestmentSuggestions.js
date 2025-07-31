import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ENDPOINTS } from '../../../config/api';

const InvestmentSuggestions = ({ userProfile, transactionSummary }) => {
    const [suggestions, setSuggestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateSuggestions = async () => {
        if (!userProfile || !transactionSummary) {
            setError('User profile and transaction summary are required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/api/ai/investment-suggestion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userProfile,
                    transactionSummary
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate investment suggestions');
            }

            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const AllocationChart = ({ allocation }) => {
        const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
        
        return (
            <div className="space-y-3">
                {Object.entries(allocation).map(([category, percentage]) => (
                    <div key={category} className="flex items-center space-x-3">
                        <div className="w-20 text-sm font-medium capitalize">{category}:</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${(percentage / total) * 100}%` }}
                            />
                        </div>
                        <div className="w-12 text-sm font-semibold">{percentage}%</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <motion.div 
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                    🤖 AI Investment Suggestions
                </h3>
                <button
                    onClick={generateSuggestions}
                    disabled={isLoading || !userProfile}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isLoading || !userProfile
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing...
                        </div>
                    ) : (
                        'Get AI Suggestions'
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {!suggestions && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">🎯</div>
                    <p>Click "Get AI Suggestions" to receive personalized investment advice based on your profile and financial data.</p>
                </div>
            )}

            {suggestions && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Risk Assessment */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-2">Risk Assessment</h4>
                        <p className="text-blue-800">{suggestions.riskAssessment}</p>
                    </div>

                    {/* Recommended Allocation */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Recommended Portfolio Allocation</h4>
                        <AllocationChart allocation={suggestions.recommendedAllocation} />
                    </div>

                    {/* Monthly Investment Amount */}
                    {suggestions.monthlyInvestmentAmount && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <h4 className="font-semibold text-green-900 mb-2">Suggested Monthly Investment</h4>
                            <p className="text-2xl font-bold text-green-700">
                                ${suggestions.monthlyInvestmentAmount.toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Emergency Fund Status */}
                    {suggestions.emergencyFundStatus && (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                            <h4 className="font-semibold text-yellow-900 mb-2">Emergency Fund Status</h4>
                            <p className="text-yellow-800">{suggestions.emergencyFundStatus}</p>
                        </div>
                    )}

                    {/* Specific Suggestions */}
                    {suggestions.specificSuggestions && suggestions.specificSuggestions.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Specific Recommendations</h4>
                            <div className="space-y-4">
                                {suggestions.specificSuggestions.map((suggestion, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <h5 className="font-medium text-gray-900 mb-2">{suggestion.category}</h5>
                                        <p className="text-gray-700 mb-2">{suggestion.recommendation}</p>
                                        <p className="text-sm text-gray-600 italic">{suggestion.reasoning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    {suggestions.nextSteps && suggestions.nextSteps.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Next Steps</h4>
                            <ul className="space-y-2">
                                {suggestions.nextSteps.map((step, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <span className="text-blue-600 font-bold">{index + 1}.</span>
                                        <span className="text-gray-700">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warnings */}
                    {suggestions.warnings && suggestions.warnings.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                            <h4 className="font-semibold text-red-900 mb-2">⚠️ Important Considerations</h4>
                            <ul className="space-y-1">
                                {suggestions.warnings.map((warning, index) => (
                                    <li key={index} className="text-red-800 text-sm">
                                        • {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="text-xs text-gray-500 italic border-t pt-4">
                        💡 These suggestions are generated by AI based on your profile and should not be considered as professional financial advice. Always consult with a qualified financial advisor before making investment decisions.
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default InvestmentSuggestions;