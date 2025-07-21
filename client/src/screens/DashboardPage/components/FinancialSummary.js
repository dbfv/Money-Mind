import React from 'react';
import { motion } from 'framer-motion';

const FinancialSummary = ({ totalAmount, financialSummary }) => {
    return (
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total in All Sources</p>
                        <p className="text-3xl font-bold text-blue-600">${totalAmount ? totalAmount.toLocaleString() : 0}</p>
                    </div>
                    <div className="text-2xl">🏦</div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">This Month's Income</p>
                        <p className="text-3xl font-bold text-green-600">${financialSummary.income.toLocaleString()}</p>
                    </div>
                    <div className="text-2xl">💰</div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">This Month's Spending</p>
                        <p className="text-3xl font-bold text-red-600">${financialSummary.spending.toLocaleString()}</p>
                    </div>
                    <div className="text-2xl">💸</div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                        <p className={`text-3xl font-bold ${financialSummary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${financialSummary.netFlow.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-2xl">📊</div>
                </div>
            </div>
        </motion.div>
    );
};

export default FinancialSummary; 