import React from 'react';
import { motion } from 'framer-motion';
import BackgroundWithCards from '../../components/BackgroundWithCards';
import Iridescence from '../../components/Iridescence';
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
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden relative">
            {/* Mobile Background - Iridescence */}
            <div className="lg:hidden absolute inset-0">
                <Iridescence
                    color={[0.8, 0.9, 1]}
                    speed={0.6}
                    amplitude={0.03}
                    mouseReact={false}
                />
            </div>

            {/* Desktop Background - Cards (Hidden on mobile) */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <BackgroundWithCards />
            </div>

            {/* Form Container */}
            <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 md:p-8 relative z-10" style={{ backgroundColor: 'transparent' }}>
                <motion.div
                    className="bg-white/95 backdrop-blur-sm lg:bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm relative z-10 border border-gray-200"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="text-center mb-6 md:mb-8" variants={itemVariants}>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                        <p className="text-sm md:text-base text-gray-600">Sign in to your account</p>
                    </motion.div>

                    <LoginForm />
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage; 