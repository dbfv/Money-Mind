import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ENDPOINTS } from '../../config/api';
import Header from './components/Header';
import FinancialSummary from './components/FinancialSummary';
import SpendingByCategory from './components/SpendingByCategory';
import CashFlowChart from './components/CashFlowChart';
import ChatIcon from '../../components/ChatIcon';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        financialSummary: { income: 0, spending: 0, netFlow: 0 },
        spendingByCategory: [],
        cashFlowData: [],
        totalAmount: 0
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

            if (!token) {
                setError('No authentication token found. Please log in first.');
                return;
            }

            const response = await fetch(ENDPOINTS.DASHBOARD, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch dashboard data');
            }

            const data = await response.json();

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
            console.error('Dashboard error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        
        // Get user ID from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserId(payload.userId || payload.id);
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }, []);

    const { financialSummary, spendingByCategory, cashFlowData, totalAmount } = dashboardData;

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
                    <motion.div variants={itemVariants}>
                        <Header />
                    </motion.div>

                    {/* Financial Summary Cards */}
                    <motion.div variants={itemVariants}>
                        <FinancialSummary
                            totalAmount={totalAmount}
                            financialSummary={financialSummary}
                        />
                    </motion.div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Spending by Category */}
                        <motion.div variants={itemVariants}>
                            <SpendingByCategory spendingByCategory={spendingByCategory} />
                        </motion.div>

                        {/* Cash Flow Chart */}
                        <motion.div variants={itemVariants}>
                            <CashFlowChart cashFlowData={cashFlowData} />
                        </motion.div>
                    </div>

                    {/* AI Chat Component */}
                    <ChatIcon 
                userId={userId} 
                onTransactionAdded={() => {
                    fetchDashboardData(); // Refreshes all dashboard data including sources
                }} 
            />

                    {/* Empty State for No Data */}
                    {spendingByCategory.length === 0 && cashFlowData.length === 0 && (
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8"
                            variants={itemVariants}
                        >
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

        </div>
    );
};

export default DashboardPage; 