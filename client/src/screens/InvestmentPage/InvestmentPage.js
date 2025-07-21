import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProfileForm from './components/ProfileForm';
import AllocationChart from './components/AllocationChart';
import RecommendationPanel from './components/RecommendationPanel';
import ProjectionChart from './components/ProjectionChart';
import Disclaimer from './components/Disclaimer';

const InvestmentPage = () => {
    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState({
        age: '',
        income: '',
        monthlyInvestment: '',
        riskTolerance: 'medium',
        assumptions: {
            inflation: 3.0,
            stockReturns: 8.0,
            bondReturns: 4.0,
            cashReturns: 1.5
        }
    });
    const [recommendation, setRecommendation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Empty chart placeholder data for layout purposes
    const emptyChartData = {
        labels: ['Year 0', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
        datasets: [
            {
                label: 'Conservative',
                data: [],
                color: '#10b981'
            },
            {
                label: 'Expected',
                data: [],
                color: '#3b82f6'
            },
            {
                label: 'Optimistic',
                data: [],
                color: '#8b5cf6'
            }
        ]
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfileData({
                ...profileData,
                [parent]: {
                    ...profileData[parent],
                    [child]: parseFloat(value)
                }
            });
        } else {
            setProfileData({
                ...profileData,
                [name]: name === 'riskTolerance' ? value : (value ? parseFloat(value) : '')
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // In a real app, this would make an API call to get recommendations
        // For now, just show the second step with empty data
        setTimeout(() => {
            setRecommendation({
                allocation: {
                    stocks: 60,
                    bonds: 30,
                    cash: 10
                },
                projections: emptyChartData,
                explanation: "This is a placeholder for API-generated investment recommendations."
            });
            setStep(2);
            setIsLoading(false);
        }, 500);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    const slideVariants = {
        enter: (direction) => {
            return {
                x: direction > 0 ? 1000 : -1000,
                opacity: 0
            };
        },
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => {
            return {
                x: direction < 0 ? 1000 : -1000,
                opacity: 0
            };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <motion.div className="mb-8" variants={itemVariants}>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment System</h1>
                        <p className="text-gray-600">Plan your investments and see projected growth</p>
                    </motion.div>

                    {/* Step 1: Profile Setup */}
                    {step === 1 && (
                        <motion.div
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            custom={1}
                        >
                            <motion.div
                                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8"
                                variants={itemVariants}
                            >
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Investment Profile</h2>
                                <ProfileForm
                                    profileData={profileData}
                                    handleInputChange={handleInputChange}
                                    handleSubmit={handleSubmit}
                                    isLoading={isLoading}
                                />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Step 2: Recommendation & Projection View */}
                    {step === 2 && recommendation && (
                        <motion.div
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            custom={-1}
                        >
                            {/* Allocation and Recommendation */}
                            <motion.div
                                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
                                variants={itemVariants}
                            >
                                <AllocationChart recommendation={recommendation} />
                                <RecommendationPanel
                                    recommendation={recommendation}
                                    onAdjustProfile={() => setStep(1)}
                                />
                            </motion.div>

                            {/* Growth Projection Chart */}
                            <ProjectionChart data={recommendation.projections} />

                            {/* Disclaimer */}
                            <Disclaimer />
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default InvestmentPage; 