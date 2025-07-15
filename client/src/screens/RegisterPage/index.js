import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BackgroundWithCards from '../../components/BackgroundWithCards';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [apiError, setApiError] = useState('');

    const { email, password, name, age } = formData;

    // Password requirements
    const passwordRequirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
        // Clear API error when user makes changes
        if (apiError) {
            setApiError('');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

        if (!password) newErrors.password = 'Password is required';
        else if (!Object.values(passwordRequirements).every(req => req)) {
            newErrors.password = 'Password does not meet all requirements';
        }

        if (!name) newErrors.name = 'Name is required';

        if (!age) newErrors.age = 'Age is required';
        else if (age < 18 || age > 120) newErrors.age = 'Age must be between 18 and 120';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setApiError('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    age: parseInt(age),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error messages from the backend
                if (data.message === 'User already exists') {
                    setApiError('An account with this email already exists. Please try logging in instead.');
                } else {
                    setApiError(data.message || 'Registration failed. Please try again.');
                }
                return;
            }

            // Success! Show success message and redirect
            setSuccessMessage('Account created successfully! Please login to continue.');

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            setApiError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5 }
        }
    };

    const buttonVariants = {
        hover: {
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
        },
        tap: { scale: 0.98 }
    };

    return (
        <div className="h-screen flex overflow-hidden relative">
            <BackgroundWithCards />

            {/* Left Side - Background with Cards */}
            <div className="w-1/2 relative">
                {/* Cards are handled by BackgroundWithCards component */}
            </div>

            {/* Right Side - Form */}
            <div className="w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#fafafe' }}>
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto relative z-10 border border-gray-200"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="text-center mb-8" variants={itemVariants}>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
                        <p className="text-gray-600">Join us and start your financial journey</p>
                    </motion.div>

                    {/* Success Message */}
                    {successMessage && (
                        <motion.div
                            className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {successMessage}
                        </motion.div>
                    )}

                    {/* API Error Message */}
                    {apiError && (
                        <motion.div
                            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {apiError}
                        </motion.div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-3">
                        {/* Email Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your email"
                                required
                            />
                            {errors.email && (
                                <motion.p
                                    className="text-red-500 text-sm mt-1"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {errors.email}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Password Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your password"
                                required
                            />

                            {/* Password Requirements */}
                            <motion.div
                                className="mt-1 p-1 bg-gray-50 rounded text-xs"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                    <div className="flex items-center">
                                        <span className={`mr-1 ${passwordRequirements.minLength ? 'text-green-500' : 'text-red-500'}`}>
                                            {passwordRequirements.minLength ? '✓' : '✗'}
                                        </span>
                                        <span className={passwordRequirements.minLength ? 'text-green-700' : 'text-red-700'}>
                                            8+ characters
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`mr-1 ${passwordRequirements.hasUppercase ? 'text-green-500' : 'text-red-500'}`}>
                                            {passwordRequirements.hasUppercase ? '✓' : '✗'}
                                        </span>
                                        <span className={passwordRequirements.hasUppercase ? 'text-green-700' : 'text-red-700'}>
                                            Uppercase letter
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`mr-1 ${passwordRequirements.hasLowercase ? 'text-green-500' : 'text-red-500'}`}>
                                            {passwordRequirements.hasLowercase ? '✓' : '✗'}
                                        </span>
                                        <span className={passwordRequirements.hasLowercase ? 'text-green-700' : 'text-red-700'}>
                                            Lowercase letter
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`mr-1 ${passwordRequirements.hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                                            {passwordRequirements.hasNumber ? '✓' : '✗'}
                                        </span>
                                        <span className={passwordRequirements.hasNumber ? 'text-green-700' : 'text-red-700'}>
                                            Number
                                        </span>
                                    </div>
                                    <div className="flex items-center col-span-2">
                                        <span className={`mr-1 ${passwordRequirements.hasSpecialChar ? 'text-green-500' : 'text-red-500'}`}>
                                            {passwordRequirements.hasSpecialChar ? '✓' : '✗'}
                                        </span>
                                        <span className={passwordRequirements.hasSpecialChar ? 'text-green-700' : 'text-red-700'}>
                                            Special character
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {errors.password && (
                                <motion.p
                                    className="text-red-500 text-sm mt-1"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {errors.password}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Name Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={onChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="What should we call you?"
                                required
                            />
                            {errors.name && (
                                <motion.p
                                    className="text-red-500 text-sm mt-1"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {errors.name}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Age Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Age
                            </label>
                            <input
                                type="number"
                                name="age"
                                value={age}
                                onChange={onChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.age ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your age"
                                min="18"
                                max="120"
                                required
                            />
                            {errors.age && (
                                <motion.p
                                    className="text-red-500 text-sm mt-1"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {errors.age}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={itemVariants}>
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creating Account...
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </motion.button>
                        </motion.div>
                    </form>

                    <motion.div
                        className="text-center mt-4"
                        variants={itemVariants}
                    >
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                                Sign in
                            </a>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage; 