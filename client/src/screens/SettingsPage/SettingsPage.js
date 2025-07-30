import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { ENDPOINTS } from '../../config/api';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Password change states
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Theme preferences state - defaults to system theme
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    // Confirmation dialog states
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        onConfirm: () => { },
        type: 'warning'
    });

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    // Handle password change form input
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    // Validate password change form
    const validatePasswordForm = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return false;
        }

        if (passwordData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }

        return true;
    };

    // Submit password change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!validatePasswordForm()) {
            return;
        }

        setIsChangingPassword(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(ENDPOINTS.CHANGE_PASSWORD, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }

            setSuccessMessage('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Handle theme change
    const handleThemeChange = (selectedTheme) => {
        setTheme(selectedTheme);
        localStorage.setItem('theme', selectedTheme);

        // Apply theme immediately
        if (selectedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (selectedTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // System theme
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        setSuccessMessage('Theme preference saved');
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(ENDPOINTS.DELETE_ACCOUNT, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete account');
            }

            // Clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login', { replace: true });
        } catch (err) {
            console.error('Error deleting account:', err);
            setError(err.message || 'Failed to delete account');
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    // Show account deletion confirmation dialog
    const showDeleteConfirmation = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Account',
            message: 'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including transactions, categories, and sources.',
            confirmText: 'Delete My Account',
            onConfirm: handleDeleteAccount,
            type: 'danger'
        });
    };

    // Show logout confirmation dialog
    const showLogoutConfirmation = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Log Out',
            message: 'Are you sure you want to log out of your account?',
            confirmText: 'Log Out',
            onConfirm: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login', { replace: true });
            },
            type: 'info'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <motion.div
                className="container mx-auto px-4 py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Success message */}
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md"
                        >
                            <p className="text-green-700">{successMessage}</p>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Security Section */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                                <h2 className="text-xl font-semibold text-white">Security</h2>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                                        <input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isChangingPassword ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                        >
                                            {isChangingPassword ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Updating...
                                                </>
                                            ) : 'Change Password'}
                                        </button>
                                    </div>
                                </form>

                                <hr className="my-6 border-gray-200" />

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Account Actions</h3>

                                    <div>
                                        <button
                                            onClick={showLogoutConfirmation}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Log Out
                                        </button>
                                    </div>

                                    <div>
                                        <button
                                            onClick={showDeleteConfirmation}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Preferences Section */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600">
                                <h2 className="text-xl font-semibold text-white">Preferences</h2>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button
                                            className={`p-4 border rounded-lg transition-all ${theme === 'light'
                                                    ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleThemeChange('light')}
                                        >
                                            <div className="flex flex-col items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                <span className="text-sm font-medium">Light</span>
                                            </div>
                                        </button>

                                        <button
                                            className={`p-4 border rounded-lg transition-all ${theme === 'dark'
                                                    ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleThemeChange('dark')}
                                        >
                                            <div className="flex flex-col items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                </svg>
                                                <span className="text-sm font-medium">Dark</span>
                                            </div>
                                        </button>

                                        <button
                                            className={`p-4 border rounded-lg transition-all ${theme === 'system'
                                                    ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleThemeChange('system')}
                                        >
                                            <div className="flex flex-col items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm font-medium">System</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <hr className="my-6 border-gray-200" />

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Data Management</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                                            <p className="text-sm text-gray-500 mb-3">Manage your income and expense categories</p>
                                            <button
                                                onClick={() => navigate('/management')}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-800"
                                            >
                                                Go to Categories
                                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">Sources</h4>
                                            <p className="text-sm text-gray-500 mb-3">Manage your money sources and accounts</p>
                                            <button
                                                onClick={() => navigate('/management')}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-800"
                                            >
                                                Go to Sources
                                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                type={confirmDialog.type}
            />
        </div>
    );
};

export default SettingsPage; 