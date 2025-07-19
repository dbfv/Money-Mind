import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Dropdown from '../../components/Dropdown';
import GradientButton from '../../components/GradientButton';

// Simple chart component for allocation
const DonutChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
    
    return (
        <div className="relative w-64 h-64 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {data.map((item, i) => {
                    const percentage = item.value / total;
                    const angle = percentage * 360;
                    
                    // Calculate the path for the slice
                    const x1 = 50 + 40 * Math.cos(Math.PI * 2 * startAngle / 360);
                    const y1 = 50 + 40 * Math.sin(Math.PI * 2 * startAngle / 360);
                    const x2 = 50 + 40 * Math.cos(Math.PI * 2 * (startAngle + angle) / 360);
                    const y2 = 50 + 40 * Math.sin(Math.PI * 2 * (startAngle + angle) / 360);
                    
                    // Determine if the angle is more than 180 degrees
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    // Create the path
                    const pathData = [
                        `M 50 50`,
                        `L ${x1} ${y1}`,
                        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');
                    
                    const path = <path 
                        key={i} 
                        d={pathData} 
                        fill={item.color}
                        stroke="#fff"
                        strokeWidth="0.5"
                    />;
                    
                    startAngle += angle;
                    return path;
                })}
                <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-700 font-medium text-lg">Allocation</div>
            </div>
        </div>
    );
};

// Simple line chart component
const LineChart = ({ data }) => {
    if (!data || !data.datasets || data.datasets.length === 0 || data.datasets[0].data.length === 0) {
        return <div className="text-center py-8 text-gray-500">No projection data available</div>;
    }
    
    // Find min and max values for scaling
    const allValues = data.datasets.flatMap(dataset => dataset.data);
    const maxValue = Math.max(...allValues);
    
    // Chart dimensions
    const height = 300;
    const width = 600;
    const padding = 40;
    
    // Calculate points for each dataset
    const getPoints = (dataset) => {
        return dataset.data.map((value, index) => {
            const x = padding + (index * (width - padding * 2) / (dataset.data.length - 1));
            const y = height - padding - ((value / maxValue) * (height - padding * 2));
            return `${x},${y}`;
        }).join(' ');
    };
    
    // Generate horizontal guide lines
    const guideLines = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
        const y = height - padding - (i * (height - padding * 2) / steps);
        guideLines.push(
            <line 
                key={i}
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="#e5e7eb" 
                strokeWidth="1"
            />
        );
    }
    
    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Guide lines */}
                {guideLines}
                
                {/* X and Y axes */}
                <line 
                    x1={padding} 
                    y1={height - padding} 
                    x2={width - padding} 
                    y2={height - padding} 
                    stroke="#9ca3af" 
                    strokeWidth="2"
                />
                <line 
                    x1={padding} 
                    y1={padding} 
                    x2={padding} 
                    y2={height - padding} 
                    stroke="#9ca3af" 
                    strokeWidth="2"
                />
                
                {/* X-axis labels (years) */}
                {data.labels.map((label, i) => {
                    const x = padding + (i * (width - padding * 2) / (data.labels.length - 1));
                    return (
                        <text 
                            key={i}
                            x={x} 
                            y={height - 15} 
                            textAnchor="middle"
                            className="text-xs fill-gray-600"
                        >
                            {label}
                        </text>
                    );
                })}
                
                {/* Y-axis labels */}
                {Array.from({ length: steps + 1 }).map((_, i) => {
                    const value = Math.round(maxValue * i / steps);
                    const y = height - padding - (i * (height - padding * 2) / steps);
                    return (
                        <text 
                            key={i}
                            x={padding - 10} 
                            y={y + 5} 
                            textAnchor="end"
                            className="text-xs fill-gray-600"
                        >
                            ${value.toLocaleString()}
                        </text>
                    );
                })}
                
                {/* Dataset lines */}
                {data.datasets.map((dataset, i) => (
                    <g key={i}>
                        <polyline 
                            points={getPoints(dataset)} 
                            fill="none" 
                            stroke={dataset.color} 
                            strokeWidth="3"
                        />
                    </g>
                ))}
            </svg>
            
            {/* Legend */}
            <div className="flex justify-center mt-4 gap-6">
                {data.datasets.map((dataset, i) => (
                    <div key={i} className="flex items-center">
                        <div 
                            className="w-4 h-4 mr-2" 
                            style={{ backgroundColor: dataset.color }}
                        />
                        <span className="text-sm text-gray-600">{dataset.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

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

    // Dropdown options
    const riskToleranceOptions = [
        { value: 'low', label: 'Low - Safety First' },
        { value: 'medium', label: 'Medium - Balanced Approach' },
        { value: 'high', label: 'High - Growth Focused' }
    ];

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

    // Format allocation data for the donut chart
    const allocationChartData = recommendation ? [
        {
            name: 'Stocks',
            value: recommendation.allocation.stocks,
            color: '#3b82f6' // Blue
        },
        {
            name: 'Bonds',
            value: recommendation.allocation.bonds,
            color: '#8b5cf6' // Purple
        },
        {
            name: 'Cash',
            value: recommendation.allocation.cash,
            color: '#10b981' // Green
        }
    ] : [];

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
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Age
                                            </label>
                                            <input
                                                type="number"
                                                name="age"
                                                value={profileData.age}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                                placeholder="e.g. 35"
                                                required
                                                min="18"
                                                max="100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Monthly Income ($)
                                            </label>
                                            <input
                                                type="number"
                                                name="income"
                                                value={profileData.income}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                                placeholder="e.g. 5000"
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Monthly Investment Amount ($)
                                            </label>
                                            <input
                                                type="number"
                                                name="monthlyInvestment"
                                                value={profileData.monthlyInvestment}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                                placeholder="e.g. 500"
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <Dropdown
                                                label="Risk Tolerance"
                                                name="riskTolerance"
                                                value={profileData.riskTolerance}
                                                onChange={handleInputChange}
                                                options={riskToleranceOptions}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Economic Assumptions</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Inflation Rate (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="assumptions.inflation"
                                                    value={profileData.assumptions.inflation}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                                    step="0.1"
                                                    min="0"
                                                    max="20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expected Stock Returns (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="assumptions.stockReturns"
                                                    value={profileData.assumptions.stockReturns}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                                    step="0.1"
                                                    min="0"
                                                    max="20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expected Bond Returns (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="assumptions.bondReturns"
                                                    value={profileData.assumptions.bondReturns}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                                    step="0.1"
                                                    min="0"
                                                    max="15"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expected Cash Returns (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="assumptions.cashReturns"
                                                    value={profileData.assumptions.cashReturns}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                                    step="0.1"
                                                    min="0"
                                                    max="10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <GradientButton
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Generating Recommendations...
                                                </div>
                                            ) : (
                                                'Get My Recommendation'
                                            )}
                                        </GradientButton>
                                    </div>
                                </form>
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
                            {/* Allocation Chart */}
                            <motion.div
                                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
                                variants={itemVariants}
                            >
                                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Recommended Allocation</h3>
                                    <div className="flex flex-col items-center">
                                        <DonutChart data={allocationChartData} />
                                        <div className="flex justify-center mt-4 gap-6">
                                            {allocationChartData.map((item, i) => (
                                                <div key={i} className="flex items-center">
                                                    <div 
                                                        className="w-4 h-4 mr-2" 
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-sm text-gray-600">
                                                        {item.name}: {item.value}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Consultation Text */}
                                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Recommendation</h3>
                                    <p className="text-gray-700 mb-6">{recommendation.explanation}</p>
                                    
                                    <div className="flex justify-end">
                                        <GradientButton
                                            onClick={() => setStep(1)}
                                            variant="secondary"
                                            size="small"
                                        >
                                            Adjust My Profile
                                        </GradientButton>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Growth Projection Chart */}
                            <motion.div
                                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8"
                                variants={itemVariants}
                            >
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Growth Projection</h3>
                                <div className="h-80">
                                    <LineChart data={recommendation.projections} />
                                </div>
                            </motion.div>

                            {/* Disclaimer */}
                            <motion.div
                                className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-lg"
                                variants={itemVariants}
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0 text-xl">
                                        ℹ️
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            <strong>Disclaimer:</strong> This is for educational purposes only and not financial advice. 
                                            Investment involves risk, and past performance is not indicative of future results. 
                                            Consider consulting with a qualified financial advisor before making investment decisions.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default InvestmentPage; 