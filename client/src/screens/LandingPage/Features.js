import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div className="mb-12" variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="text-3xl mb-3">🤖</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered Insights</h3>
                    <p className="text-gray-600 text-sm">Smart financial recommendations tailored to your goals</p>
                </motion.div>
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Analytics</h3>
                    <p className="text-gray-600 text-sm">Track your spending patterns and financial growth</p>
                </motion.div>
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Goal Setting</h3>
                    <p className="text-gray-600 text-sm">Set and achieve your financial milestones</p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Features; 