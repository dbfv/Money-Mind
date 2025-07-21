import React from 'react';
import { motion } from 'framer-motion';

const RecommendationPanel = ({ recommendation, onAdjustProfile }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Recommendation</h3>
            <p className="text-gray-700 mb-6">{recommendation.explanation}</p>

            <div className="flex justify-end">
                <motion.button
                    onClick={onAdjustProfile}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                    Adjust My Profile
                </motion.button>
            </div>
        </div>
    );
};

export default RecommendationPanel; 