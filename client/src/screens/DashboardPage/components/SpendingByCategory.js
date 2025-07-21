import React from 'react';
import { motion } from 'framer-motion';

const SpendingByCategory = ({ spendingByCategory }) => {
    return (
        <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
            {spendingByCategory.length > 0 ? (
                <div className="space-y-4">
                    {spendingByCategory.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm font-medium text-gray-700">{item.category}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${item.percentage}%`,
                                            backgroundColor: item.color
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">${item.amount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No spending data available</p>
                </div>
            )}
        </motion.div>
    );
};

export default SpendingByCategory; 