import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavigationBar = () => {
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Journal', path: '/journal', icon: '📝' },
        { name: 'Calendar', path: '/calendar', icon: '📅' },
        { name: 'Investments', path: '/investments', icon: '📈' },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    const containerVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.95 }
    };

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm z-50"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <span className="text-xl font-bold shiny-text">Money Mind</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <motion.div
                                key={item.path}
                                variants={itemVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <Link
                                    to={item.path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Profile/Settings */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <motion.button
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-lg">🔔</span>
                        </motion.button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <motion.button
                                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    👤
                                </div>
                                <span className="hidden sm:block text-sm font-medium">Profile</span>
                                <span className="text-xs">▼</span>
                            </motion.button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <motion.div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <span className="mr-2">👤</span>
                                        My Profile
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <span className="mr-2">⚙️</span>
                                        Settings
                                    </Link>
                                    <hr className="my-2" />
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            window.location.href = '/login';
                                            setIsProfileOpen(false);
                                        }}
                                    >
                                        <span className="mr-2">🚪</span>
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden absolute top-4 right-4">
                <motion.button
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="text-lg">☰</span>
                </motion.button>
            </div>
        </motion.nav>
    );
};

export default NavigationBar; 