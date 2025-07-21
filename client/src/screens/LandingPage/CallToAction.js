import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CallToAction = () => {
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

    const buttonVariants = {
        hover: {
            scale: 1.05,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.95 }
    };

    return (
        <>
            <motion.div className="space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row justify-center items-center" variants={itemVariants}>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Link
                        to="/register"
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                        Start Your Journey
                    </Link>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Link
                        to="/login"
                        className="inline-block bg-white/90 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg border border-gray-200 hover:bg-white transition-all duration-300"
                    >
                        Sign In
                    </Link>
                </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div className="mt-12 text-gray-500 text-sm" variants={itemVariants}>
                <p>Trusted by thousands of users worldwide</p>
            </motion.div>
        </>
    );
};

export default CallToAction; 