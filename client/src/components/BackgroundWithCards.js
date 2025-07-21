import React from 'react';
import { motion } from 'framer-motion';

const BackgroundWithCards = () => {
    const features = [
        {
            title: "AI Integrated",
            description: "Smart financial insights powered by artificial intelligence",
            icon: "🤖",
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Money Management",
            description: "Track and organize your finances effortlessly",
            icon: "💰",
            color: "from-green-500 to-emerald-500"
        },
        {
            title: "Invest Suggestion",
            description: "Get personalized investment recommendations",
            icon: "📈",
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Money Calendar",
            description: "Plan and schedule your financial activities",
            icon: "📅",
            color: "from-orange-500 to-red-500"
        }
    ];

    const floatingVariants = {
        float1: {
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 8, 0],
            scale: [1, 1.1, 1],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        float2: {
            y: [0, 25, 0],
            x: [0, -12, 0],
            rotate: [0, -6, 0],
            scale: [1, 0.9, 1],
            transition: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        float3: {
            y: [0, -20, 0],
            x: [0, 20, 0],
            rotate: [0, 4, 0],
            scale: [1, 1.08, 1],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        float4: {
            y: [0, 30, 0],
            x: [0, -18, 0],
            rotate: [0, -8, 0],
            scale: [1, 0.92, 1],
            transition: {
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="fixed inset-0 overflow-hidden">
            {/* Background Image - Left Side Only */}
            <div
                className="absolute left-0 top-0 w-1/2 h-full bg-contain bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('/images/financial-management-concept-and-investment-flat-design-of-payment-and-finance-with-money-cash-banknote-calculator-and-credit-card-illustration-and-banner-template-free-png.webp')`
                }}
            />

            {/* Gradient Overlay - Left Side Only */}
            <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-blue-50/40 via-indigo-50/40 to-purple-50/40" />

            {/* Floating Feature Cards - At Corners of Image */}
            <div className="absolute left-0 top-0 w-1/2 h-full pointer-events-none">
                {/* Card 1 - Top Left */}
                <motion.div
                    className="absolute top-16 left-16 w-48 h-40"
                    variants={floatingVariants}
                    animate="float1"
                >
                    <div className={`w-full h-full bg-gradient-to-br ${features[0].color} rounded-2xl shadow-2xl p-4 backdrop-blur-sm bg-opacity-95 border border-white/20`}>
                        <div className="text-3xl mb-2">{features[0].icon}</div>
                        <h3 className="text-white font-bold text-sm mb-1">{features[0].title}</h3>
                        <p className="text-white/95 text-xs leading-tight">{features[0].description}</p>
                    </div>
                </motion.div>

                {/* Card 2 - Top Right */}
                <motion.div
                    className="absolute top-16 right-16 w-48 h-40"
                    variants={floatingVariants}
                    animate="float2"
                >
                    <div className={`w-full h-full bg-gradient-to-br ${features[1].color} rounded-2xl shadow-2xl p-4 backdrop-blur-sm bg-opacity-95 border border-white/20`}>
                        <div className="text-3xl mb-2">{features[1].icon}</div>
                        <h3 className="text-white font-bold text-sm mb-1">{features[1].title}</h3>
                        <p className="text-white/95 text-xs leading-tight">{features[1].description}</p>
                    </div>
                </motion.div>

                {/* Card 3 - Bottom Left */}
                <motion.div
                    className="absolute bottom-16 left-16 w-48 h-40"
                    variants={floatingVariants}
                    animate="float3"
                >
                    <div className={`w-full h-full bg-gradient-to-br ${features[2].color} rounded-2xl shadow-2xl p-4 backdrop-blur-sm bg-opacity-95 border border-white/20`}>
                        <div className="text-3xl mb-2">{features[2].icon}</div>
                        <h3 className="text-white font-bold text-sm mb-1">{features[2].title}</h3>
                        <p className="text-white/95 text-xs leading-tight">{features[2].description}</p>
                    </div>
                </motion.div>

                {/* Card 4 - Bottom Right */}
                <motion.div
                    className="absolute bottom-16 right-16 w-48 h-40"
                    variants={floatingVariants}
                    animate="float4"
                >
                    <div className={`w-full h-full bg-gradient-to-br ${features[3].color} rounded-2xl shadow-2xl p-4 backdrop-blur-sm bg-opacity-95 border border-white/20`}>
                        <div className="text-3xl mb-2">{features[3].icon}</div>
                        <h3 className="text-white font-bold text-sm mb-1">{features[3].title}</h3>
                        <p className="text-white/95 text-xs leading-tight">{features[3].description}</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BackgroundWithCards; 