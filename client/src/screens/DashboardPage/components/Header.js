import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    const buttonVariants = {
        hover: { scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" },
        tap: { scale: 0.95 }
    };

    return (
        <motion.div className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
            </div>
            <motion.button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate('/journal?showForm=true')}
            >
                <span className="mr-2">➕</span>
                Add Transaction
            </motion.button>
        </motion.div>
    );
};

export default Header; 