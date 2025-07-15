import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    };

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

    const floatingVariants = {
        float: {
            y: [0, -10, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
            {/* Background Elements */}
            <motion.div
                className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20"
                variants={floatingVariants}
                animate="float"
            />
            <motion.div
                className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-20"
                variants={floatingVariants}
                animate="float"
                style={{ animationDelay: '1s' }}
            />
            <motion.div
                className="absolute top-1/2 left-10 w-16 h-16 bg-indigo-200 rounded-full opacity-20"
                variants={floatingVariants}
                animate="float"
                style={{ animationDelay: '2s' }}
            />

            <motion.div
                className="text-center max-w-4xl mx-auto px-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Brand Section */}
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

                {/* Features Section */}
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

                {/* CTA Section */}
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
            </motion.div>
        </div>
    );
};

export default LandingPage; 