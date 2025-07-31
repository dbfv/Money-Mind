import React from 'react';
import { motion } from 'framer-motion';

const FinancialSummary = ({ totalAmount, financialSummary }) => {
    return (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Total in All Sources</p>
                        <p className="text-xl md:text-3xl font-bold text-blue-600">${totalAmount ? totalAmount.toLocaleString() : 0}</p>
                    </div>
                    <div className="text-xl md:text-2xl ml-2">🏦</div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-gray-600 truncate">This Month's Income</p>
                        <p className="text-xl md:text-3xl font-bold text-green-600">${financialSummary.income.toLocaleString()}</p>
                    </div>
                    <div className="text-xl md:text-2xl ml-2">💰</div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-gray-600 truncate">This Month's Spending</p>
                        <p className="text-xl md:text-3xl font-bold text-red-600">${financialSummary.spending.toLocaleString()}</p>
                    </div>
                    <div className="text-xl md:text-2xl ml-2">💸</div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Net Cash Flow</p>
                        <p className={`text-xl md:text-3xl font-bold ${financialSummary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${financialSummary.netFlow.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-xl md:text-2xl ml-2">📊</div>
                </div>
            </div>
        </motion.div>
    );
};

export default FinancialSummary; 