import React from 'react';
import { motion } from 'framer-motion';

const CashFlowChart = ({ cashFlowData }) => {
    return (
        <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow (Last 30 Days)</h3>
            {cashFlowData.length > 0 ? (
                <>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {cashFlowData.map((data, index) => {
                            const maxBalance = Math.max(...cashFlowData.map(d => d.balance));
                            const height = maxBalance > 0 ? (data.balance / maxBalance) * 200 : 0;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                                        style={{ height: `${height}px` }}
                                    ></div>
                                    <span className="text-xs text-gray-500 mt-2">
                                        {new Date(data.date).getDate()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-center">
                        <span className="text-sm text-gray-600">Balance trend over the past 30 days</span>
                    </div>
                </>
            ) : (
                <div className="h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📈</div>
                        <p>No cash flow data available</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CashFlowChart; 