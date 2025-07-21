import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
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
        <motion.div className="mb-8" variants={itemVariants}>
            <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
            >
                🧠
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 relative overflow-hidden">
                <span className="shiny-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Money Mind
                </span>
            </h1>
            <p className="text-xl text-gray-600 mb-2">
                Master Your Financial Future
            </p>
        </motion.div>
    );
};

export default Hero; 