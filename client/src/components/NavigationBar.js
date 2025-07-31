import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from './Dropdown';
import { ENDPOINTS } from '../config/api';
import EventEmitter, { APP_EVENTS } from '../utils/events';

const NavigationBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userAvatar, setUserAvatar] = useState('');
    const [userName, setUserName] = useState('');

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Journal', path: '/journal', icon: '📝' },
        { name: 'Calendar', path: '/calendar', icon: '📅' },
        { name: 'Investments', path: '/investments', icon: '📈' },
    ];

    // Fetch user profile data including avatar
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(ENDPOINTS.USER_PROFILE, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserAvatar(data.avatar || '');
                    setUserName(data.name || '');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();

        // Subscribe to avatar update events
        const unsubscribe = EventEmitter.on(APP_EVENTS.AVATAR_UPDATED, (avatarUrl) => {
            setUserAvatar(avatarUrl);
        });

        // Clean up the subscription when the component unmounts
        return () => {
            unsubscribe();
        };
    }, []);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const profileOptions = [
        { value: 'profile', label: <span><span className="mr-2">👤</span>My Profile</span> },
        { value: 'settings', label: <span><span className="mr-2">⚙️</span>Settings</span> },
        { value: 'signout', label: <span className="text-red-600"><span className="mr-2">🚪</span>Sign Out</span> },
    ];

    const handleProfileChange = (e) => {
        const value = e.target.value;
        if (value === 'profile') {
            navigate('/profile');
        } else if (value === 'settings') {
            navigate('/settings');
        } else if (value === 'signout') {
            handleLogout();
        }
    };

    const handleLogout = () => {
        // Logout logic: remove JWT and user info, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
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

    // Generate the avatar component
    const renderAvatar = () => {
        if (userAvatar) {
            return (
                <img
                    src={userAvatar}
                    alt={`${userName}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
            );
        }

        return (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
                {userName ? userName.charAt(0).toUpperCase() : "👤"}
            </div>
        );
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
                            <span className="shiny-text text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Money Mind
                            </span>
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

                    {/* Profile/Settings - Hidden on mobile */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Notifications */}
                        <motion.button
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-lg">🔔</span>
                        </motion.button>

                        {/* Profile Dropdown */}
                        <div>
                            <Dropdown
                                label={null}
                                name="profileDropdown"
                                value={''}
                                onChange={handleProfileChange}
                                options={profileOptions}
                                placeholder={renderAvatar()}
                                className=""
                                borderless={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Button */}
            {/* Mobile menu button */}
            <div className="md:hidden absolute top-4 right-4">
                <motion.button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="text-lg">{isMobileMenuOpen ? '✕' : '☰'}</span>
                </motion.button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-16 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    >
                        <div className="p-4 space-y-2">
                            {/* User Info Section */}
                            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                                {renderAvatar()}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{userName || 'User'}</p>
                                    <p className="text-xs text-gray-500">Manage your account</p>
                                </div>
                            </div>

                            {/* Navigation Items */}
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        location.pathname === item.path
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                            
                            {/* Account Actions */}
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                                >
                                    <span className="mr-2">👤</span>
                                    My Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                                >
                                    <span className="mr-2">⚙️</span>
                                    Settings
                                </Link>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                                >
                                    <span className="mr-2">🔔</span>
                                    Notifications
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                                >
                                    <span className="mr-2">🚪</span>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default NavigationBar; 