import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        financialSummary: { income: 0, spending: 0, netFlow: 0 },
        spendingByCategory: [],
        cashFlowData: [],
        totalAmount: 0,
        jars: []
    });
    const navigate = useNavigate();

    // Color palette for categories
    const categoryColors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280',
        '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#A855F7', '#06B6D4'
    ];

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            console.log('Token:', token); // Debug log

            if (!token) {
                setError('No authentication token found. Please log in first.');
                return;
            }

            console.log('Fetching dashboard data...'); // Debug log

            const response = await fetch('http://localhost:5000/api/transactions/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status); // Debug log

            if (!response.ok) {
                const errorData = await response.json();
                console.log('Error response:', errorData); // Debug log
                throw new Error(errorData.message || 'Failed to fetch dashboard data');
            }

            const data = await response.json();
            console.log('Dashboard data:', data); // Debug log

            // Add colors to spending by category
            const spendingWithColors = data.spendingByCategory.map((item, index) => ({
                ...item,
                color: categoryColors[index % categoryColors.length]
            }));

            setDashboardData({
                ...data,
                spendingByCategory: spendingWithColors
            });
        } catch (error) {
            console.error('Dashboard error:', error); // Debug log
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const { financialSummary, spendingByCategory, cashFlowData, totalAmount, jars } = dashboardData;

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

    const buttonVariants = {
        hover: { scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" },
        tap: { scale: 0.95 }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading dashboard data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <motion.button
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fetchDashboardData}
                        >
                            Try Again
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <motion.div className="mb-8 flex justify-between items-center" variants={itemVariants}>
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

                    {/* Financial Summary Cards */}
                    <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" variants={itemVariants}>
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total in All Sources</p>
                                    <p className="text-3xl font-bold text-blue-600">${totalAmount ? totalAmount.toLocaleString() : 0}</p>
                                </div>
                                <div className="text-2xl">🏦</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month's Income</p>
                                    <p className="text-3xl font-bold text-green-600">${financialSummary.income.toLocaleString()}</p>
                                </div>
                                <div className="text-2xl">💰</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month's Spending</p>
                                    <p className="text-3xl font-bold text-red-600">${financialSummary.spending.toLocaleString()}</p>
                                </div>
                                <div className="text-2xl">💸</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                                    <p className={`text-3xl font-bold ${financialSummary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${financialSummary.netFlow.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-2xl">📊</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Spending by Category */}
                        <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200" variants={itemVariants}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
                            {spendingByCategory.length > 0 ? (
                                <div className="space-y-4">
                                    {spendingByCategory.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                ></div>
                                                <span className="text-sm font-medium text-gray-700">{item.category}</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${item.percentage}%`,
                                                            backgroundColor: item.color
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">${item.amount}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">📊</div>
                                    <p>No spending data available</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Cash Flow Chart */}
                        <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200" variants={itemVariants}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow (Last 30 Days)</h3>
                            {cashFlowData.length > 0 ? (
                                <>
                                    <div className="h-64 flex items-end justify-between space-x-2">
                                        {cashFlowData.map((data, index) => {
                                            const maxBalance = Math.max(...cashFlowData.map(d => d.balance));
                                            const height = maxBalance > 0 ? (data.balance / maxBalance) * 200 : 0;
                                            return (
                                                <div key={index} className="flex-1 flex flex-col items-center">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                                                        style={{ height: `${height}px` }}
                                                    ></div>
                                                    <span className="text-xs text-gray-500 mt-2">
                                                        {new Date(data.date).getDate()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <span className="text-sm text-gray-600">Balance trend over the past 30 days</span>
                                    </div>
                                </>
                            ) : (
                                <div className="h-64 flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <div className="text-4xl mb-2">📈</div>
                                        <p>No cash flow data available</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* 6 Jars Analysis Section */}
                    {jars && (
                        <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8" variants={itemVariants}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">6 Jars Money Management</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {jars.map((jar, idx) => (
                                    <div key={idx} className="flex flex-col items-center bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
                                        <span className="text-xl font-bold text-blue-700 mb-1">{jar.label}</span>
                                        <span className="text-2xl font-semibold text-gray-900 mb-1">${jar.amount.toLocaleString()}</span>
                                        <span className="text-sm text-gray-500">{jar.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Empty State for No Data */}
                    {spendingByCategory.length === 0 && cashFlowData.length === 0 && (
                        <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8" variants={itemVariants}>
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📊</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
                                <p className="text-gray-600 mb-6">Start adding transactions to see your financial insights here.</p>
                                <motion.button
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/journal?showForm=true')}
                                >
                                    <span className="mr-2">➕</span>
                                    Add Your First Transaction
                                </motion.button>
                            </div>
                        </motion.div>
                    )}


                </motion.div>
            </div>

            {/* AI Copilot Bubble */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
            >
                <motion.button
                    className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white text-2xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsAIOpen(!isAIOpen)}
                >
                    🤖
                </motion.button>

                {/* AI Chat Window */}
                {isAIOpen && (
                    <motion.div
                        className="absolute bottom-20 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">AI Copilot</h4>
                            <button
                                onClick={() => setIsAIOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-700">
                                Hi! I'm here to help with your financial questions. How can I assist you today?
                            </p>
                        </div>
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default DashboardPage; 