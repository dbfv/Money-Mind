import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const { email, password } = formData;

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setApiError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error messages from the backend
                if (data.message === 'Invalid credentials') {
                    setApiError('Invalid email or password. Please try again.');
                } else {
                    setApiError(data.message || 'Login failed. Please try again.');
                }
                return;
            }

            // Success! Store the token and redirect
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect to dashboard or home page
            navigate('/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            setApiError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
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
        <>
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

            <form onSubmit={onSubmit} className="space-y-6">
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
                        className={`w - full px - 4 py - 3 border rounded - lg focus: ring - 2 focus: ring - blue - 500 focus: border - transparent transition - all duration - 200 ${ errors.email ? 'border-red-500' : 'border-gray-300' }`}
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
                        className={`w - full px - 4 py - 3 border rounded - lg focus: ring - 2 focus: ring - blue - 500 focus: border - transparent transition - all duration - 200 ${ errors.password ? 'border-red-500' : 'border-gray-300' }`}
                        placeholder="Enter your password"
                        required
                    />
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

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className={`w - full py - 3 px - 6 rounded - lg font - medium text - white transition - all duration - 200 ${
                isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Signing In...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </motion.div>
            </form>

            <motion.div
                className="text-center mt-6"
                variants={itemVariants}
            >
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </>
    );
};

export default LoginForm; 