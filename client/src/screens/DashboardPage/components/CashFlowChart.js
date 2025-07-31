import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CashFlowChart = ({ cashFlowData }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    return (
        <motion.div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Cash Flow (Last 30 Days)</h3>
            {cashFlowData.length > 0 ? (
                <>
                    <div className="h-48 md:h-64 flex items-end justify-between space-x-1 md:space-x-2 overflow-x-auto">
                        {cashFlowData.map((data, index) => {
                            const maxBalance = Math.max(...cashFlowData.map(d => d.balance));
                            const baseHeight = isMobile ? 150 : 200; // Responsive base height
                            const height = maxBalance > 0 ? (data.balance / maxBalance) * baseHeight : 0;
                            return (
                                <div key={index} className="flex-1 min-w-[20px] md:min-w-[30px] flex flex-col items-center">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                                        style={{ height: `${height}px`, minHeight: '4px' }}
                                        title={`${new Date(data.date).toLocaleDateString()}: $${data.balance.toLocaleString()}`}
                                    ></div>
                                    <span className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2 transform rotate-0 md:rotate-0">
                                        {new Date(data.date).getDate()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-3 md:mt-4 text-center">
                        <span className="text-xs md:text-sm text-gray-600">Balance trend over the past 30 days</span>
                    </div>
                </>
            ) : (
                <div className="h-48 md:h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="text-2xl md:text-4xl mb-2">📈</div>
                        <p className="text-sm md:text-base">No cash flow data available</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CashFlowChart; 