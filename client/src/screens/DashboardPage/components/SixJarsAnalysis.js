import React from 'react';
import { motion } from 'framer-motion';

const SixJarsAnalysis = ({ jars }) => {
    if (!jars) return null;

    return (
        <motion.div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-200 mb-8">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">6 Jars Money Management</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {jars.map((jar, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
                        <span className="text-sm md:text-lg font-bold text-blue-700 mb-1 text-center">{jar.label}</span>
                        <span className="text-lg md:text-2xl font-semibold text-gray-900 mb-1">${jar.amount.toLocaleString()}</span>
                        <span className="text-xs md:text-sm text-gray-500">{jar.percent}%</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default SixJarsAnalysis; 