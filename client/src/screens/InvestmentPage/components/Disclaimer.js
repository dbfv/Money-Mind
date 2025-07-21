import React from 'react';
import { motion } from 'framer-motion';

const Disclaimer = () => {
    return (
        <motion.div
            className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-lg"
        >
            <div className="flex">
                <div className="flex-shrink-0 text-xl">
                    ℹ️
                </div>
                <div className="ml-3">
                    <p className="text-sm text-blue-700">
                        <strong>Disclaimer:</strong> This is for educational purposes only and not financial advice.
                        Investment involves risk, and past performance is not indicative of future results.
                        Consider consulting with a qualified financial advisor before making investment decisions.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Disclaimer; 