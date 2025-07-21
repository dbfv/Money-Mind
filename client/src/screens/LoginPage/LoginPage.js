import React from 'react';
import { motion } from 'framer-motion';
import BackgroundWithCards from '../../components/BackgroundWithCards';
import LoginForm from './LoginForm';

const LoginPage = () => {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="h-screen flex overflow-hidden relative">
            {/* Left Side - Background with Cards */}
            <div className="w-1/2 relative">
                <BackgroundWithCards />
            </div>

            {/* Right Side - Form */}
            <div className="w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#fafafe' }}>
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative z-10 border border-gray-200"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="text-center mb-8" variants={itemVariants}>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to your account</p>
                    </motion.div>

                    <LoginForm />
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage; 