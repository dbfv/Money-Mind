import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header = ({ onAddTransaction }) => {
    const navigate = useNavigate();

    return (
        <motion.div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal</h1>
                <p className="text-gray-600">Track your financial transactions and insights.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
                <motion.button
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/manage')}
                >
                    <span className="text-xl">⚙️</span>
                    <span>Manage</span>
                </motion.button>
                <motion.button
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onAddTransaction}
                >
                    <span className="text-xl">➕</span>
                    <span>Add Transaction</span>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default Header; 