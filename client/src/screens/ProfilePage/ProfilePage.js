import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ENDPOINTS } from '../../config/api';
// Import the EventEmitter
import EventEmitter, { APP_EVENTS } from '../../utils/events';
import { useToast } from '../../components/ToastProvider';

const ProfilePage = () => {
    const { showToast } = useToast();
    
    // State for user profile data
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        age: '',
        avatar: '',
        investmentProfile: {
            riskTolerance: 'medium',
            monthlyInvestableIncome: 0,
            aiSuggestedIncome: null,
            economicAssumptions: {
                inflationRate: 2.5,
                bankInterestRate: 1.0
            }
        }
    });

    // State for UI interactions
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isCalculatingSuggestion, setIsCalculatingSuggestion] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingInvestmentProfile, setIsSubmittingInvestmentProfile] = useState(false);

    // Fetch user profile on component mount
    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Function to fetch user profile data
    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(ENDPOINTS.USERS + '/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile({
                name: data.name || '',
                email: data.email || '',
                age: data.age || '',
                avatar: data.avatar || '',
                investmentProfile: {
                    riskTolerance: data.investmentProfile?.riskTolerance || 'medium',
                    monthlyInvestableIncome: data.investmentProfile?.monthlyInvestableIncome || 0,
                    aiSuggestedIncome: data.investmentProfile?.aiSuggestedIncome || null,
                    economicAssumptions: {
                        inflationRate: data.investmentProfile?.economicAssumptions?.inflationRate || 2.5,
                        bankInterestRate: data.investmentProfile?.economicAssumptions?.bankInterestRate || 1.0
                    }
                }
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle personal info form changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle investment profile form changes
    const handleInvestmentProfileChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        // Convert number strings to numbers
        if (name === 'monthlyInvestableIncome' ||
            name === 'inflationRate' ||
            name === 'bankInterestRate') {
            processedValue = parseFloat(value) || 0;
        }

        // Handle nested economicAssumptions
        if (name === 'inflationRate' || name === 'bankInterestRate') {
            setProfile(prev => ({
                ...prev,
                investmentProfile: {
                    ...prev.investmentProfile,
                    economicAssumptions: {
                        ...prev.investmentProfile.economicAssumptions,
                        [name]: processedValue
                    }
                }
            }));
        } else {
            // Handle other investment profile fields
            setProfile(prev => ({
                ...prev,
                investmentProfile: {
                    ...prev.investmentProfile,
                    [name]: processedValue
                }
            }));
        }
    };

    // Handle personal info form submission
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(ENDPOINTS.USERS + '/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: profile.name,
                    age: parseInt(profile.age)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const data = await response.json();
            setProfile(prev => ({
                ...prev,
                name: data.name,
                age: data.age
            }));
            showToast('Profile updated successfully!', { type: 'success' });
        } catch (err) {
            console.error('Error updating profile:', err);
            showToast(err.message || 'Failed to update profile', { type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle investment profile form submission
    const handleInvestmentProfileSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsSubmittingInvestmentProfile(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(ENDPOINTS.USERS + '/investment-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    riskTolerance: parseInt(profile.investmentProfile.riskTolerance, 10),
                    monthlyInvestableIncome: parseFloat(profile.investmentProfile.monthlyInvestableIncome),
                    inflationRate: parseFloat(profile.investmentProfile.economicAssumptions.inflationRate),
                    bankInterestRate: parseFloat(profile.investmentProfile.economicAssumptions.bankInterestRate)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update investment profile');
            }

            const data = await response.json();
            setProfile(prev => ({
                ...prev,
                investmentProfile: data.investmentProfile
            }));
            showToast('Investment profile updated successfully!', { type: 'success' });
        } catch (err) {
            console.error('Error updating investment profile:', err);
            showToast(err.message || 'Failed to update investment profile', { type: 'error' });
        } finally {
            setIsSubmittingInvestmentProfile(false);
        }
    };

    // Handle calculation of suggested investable income
    const handleCalculateSuggestion = async () => {
        setIsCalculatingSuggestion(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(ENDPOINTS.USERS + '/suggest-investable-income', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to calculate suggestion');
            }

            // Update the profile with the suggested amount
            setProfile(prev => ({
                ...prev,
                investmentProfile: {
                    ...prev.investmentProfile,
                    aiSuggestedIncome: data.suggestedAmount,
                    monthlyInvestableIncome: data.suggestedAmount
                }
            }));

            showToast(data.message, { type: 'success', duration: 5000 });
        } catch (err) {
            console.error('Error calculating suggestion:', err);
            showToast(err.message, { type: 'error' });
        } finally {
            setIsCalculatingSuggestion(false);
        }
    };

    // Add these new functions for avatar handling
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Avatar image must be less than 5MB', { type: 'error' });
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                showToast('Only image files are allowed', { type: 'error' });
                return;
            }

            setAvatarFile(file);

            // Create a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Update the handleAvatarUpload function to emit an event on success
    const handleAvatarUpload = async () => {
        if (!avatarFile) {
            showToast('Please select an image to upload', { type: 'error' });
            return;
        }

        setIsUploadingAvatar(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Create FormData object to send the file
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const response = await fetch(ENDPOINTS.USER_AVATAR, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload avatar');
            }

            const data = await response.json();

            // Update the profile state
            setProfile(prev => ({
                ...prev,
                avatar: data.avatar
            }));

            // Emit an event for the NavigationBar to update
            EventEmitter.emit(APP_EVENTS.AVATAR_UPDATED, data.avatar);

            // Reset the file state
            setAvatarFile(null);
            setPreviewUrl(null);
            showToast('Avatar updated successfully!', { type: 'success' });
        } catch (err) {
            console.error('Error uploading avatar:', err);
            showToast(err.message, { type: 'error' });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading profile...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Personal Information Section */}
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={profile.name}
                                                onChange={handleProfileChange}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={profile.email}
                                                disabled
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed as it's used for account identification</p>
                                        </div>
                                    </div>

                                    {/* Avatar Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                                    className="relative group"
                                                >
                                                    {profile.avatar || previewUrl ? (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            key={previewUrl || profile.avatar}
                                                        >
                                                            <img
                                                                src={previewUrl || profile.avatar}
                                                                alt="User avatar"
                                                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 ring-2 ring-offset-2 ring-blue-500"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                <label htmlFor="avatar-upload" className="cursor-pointer text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded-md hover:bg-opacity-75 transition-all">
                                                                    Change
                                                                </label>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-offset-2 ring-blue-500"
                                                        >
                                                            <span className="text-white text-3xl font-semibold">
                                                                {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
                                                            </span>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex items-center">
                                                        <label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                                            <svg className="mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {profile.avatar ? 'Change Avatar' : 'Upload Avatar'}
                                                        </label>
                                                        <input
                                                            id="avatar-upload"
                                                            name="avatar"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleAvatarChange}
                                                            className="sr-only"
                                                        />
                                                    </div>

                                                    {avatarFile && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={handleAvatarUpload}
                                                                disabled={isUploadingAvatar}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
                                                            >
                                                                {isUploadingAvatar ? (
                                                                    <>
                                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        Uploading...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                                        </svg>
                                                                        Upload
                                                                    </>
                                                                )}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setAvatarFile(null);
                                                                    setPreviewUrl(null);
                                                                }}
                                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                                            >
                                                                <svg className="mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Cancel
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500">JPG, PNG, or GIF up to 5MB. Your avatar will be visible in the navigation bar.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                                        <input
                                            id="age"
                                            name="age"
                                            type="number"
                                            value={profile.age}
                                            onChange={handleProfileChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            min="18"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>

                        {/* Investment Profile Section */}
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-teal-600">
                                <h2 className="text-xl font-semibold text-white">Investment Profile</h2>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleInvestmentProfileSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700">Risk Tolerance</label>
                                        <div className="mt-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Conservative (1)</span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {profile.investmentProfile.riskTolerance}/100
                                                </span>
                                                <span className="text-xs text-gray-500">Aggressive (100)</span>
                                            </div>
                                            <input
                                                id="riskTolerance"
                                                name="riskTolerance"
                                                type="range"
                                                min="1"
                                                max="100"
                                                value={profile.investmentProfile.riskTolerance}
                                                onChange={handleInvestmentProfileChange}
                                                className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-500">Low Risk</span>
                                                <span className="text-xs text-gray-500">Medium Risk</span>
                                                <span className="text-xs text-gray-500">High Risk</span>
                                            </div>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {profile.investmentProfile.riskTolerance < 33 ? 'Conservative: Focus on preserving capital with minimal risk.' :
                                                profile.investmentProfile.riskTolerance < 67 ? 'Balanced: Mix of growth and stability for moderate returns.' :
                                                    'Aggressive: Prioritizing growth with higher volatility and potential returns.'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="monthlyInvestableIncome" className="block text-sm font-medium text-gray-700">Monthly Investable Income</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    name="monthlyInvestableIncome"
                                                    id="monthlyInvestableIncome"
                                                    min="0"
                                                    step="10"
                                                    value={profile.investmentProfile.monthlyInvestableIncome}
                                                    onChange={handleInvestmentProfileChange}
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                                    placeholder="0.00"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">USD</span>
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">How much you can invest monthly</p>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-gray-700">AI Suggestion</label>
                                                <button
                                                    type="button"
                                                    onClick={handleCalculateSuggestion}
                                                    disabled={isCalculatingSuggestion}
                                                    className="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    {isCalculatingSuggestion ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Calculating...
                                                        </>
                                                    ) : 'Recalculate'}
                                                </button>
                                            </div>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    id="aiSuggestedIncome"
                                                    value={profile.investmentProfile.aiSuggestedIncome || 0}
                                                    disabled
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-gray-50"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">USD</span>
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">AI suggested monthly investment</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Economic Assumptions</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="inflationRate" className="block text-sm font-medium text-gray-700">Inflation Rate (%)</label>
                                                <input
                                                    id="inflationRate"
                                                    name="inflationRate"
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={profile.investmentProfile.economicAssumptions.inflationRate}
                                                    onChange={handleInvestmentProfileChange}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="bankInterestRate" className="block text-sm font-medium text-gray-700">Bank Interest Rate (%)</label>
                                                <input
                                                    id="bankInterestRate"
                                                    name="bankInterestRate"
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={profile.investmentProfile.economicAssumptions.bankInterestRate}
                                                    onChange={handleInvestmentProfileChange}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmittingInvestmentProfile}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isSubmittingInvestmentProfile ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                                        >
                                            {isSubmittingInvestmentProfile ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : 'Save Investment Settings'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage; 