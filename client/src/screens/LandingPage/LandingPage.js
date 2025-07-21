import React from 'react';
import { motion } from 'framer-motion';
import Iridescence from '../../components/Iridescence';
import Hero from './Hero';
import Features from './Features';
import CallToAction from './CallToAction';

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

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Iridescence Background */}
            <div className="absolute inset-0">
                <Iridescence
                    color={[1, 1, 1]}
                    speed={0.8}
                    amplitude={0.05}
                    mouseReact={false}
                />
            </div>

            {/* Invisible overlay to prevent mouse interaction with background */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} />

            <motion.div
                className="text-center max-w-4xl mx-auto px-8 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Hero />
                <Features />
                <CallToAction />
            </motion.div>
        </div>
    );
};

export default LandingPage; 