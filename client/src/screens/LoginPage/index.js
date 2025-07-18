// Import necessary libraries and components from React and other packages.
import React, { useState } from 'react';
import { motion } from 'framer-motion'; // For animations
import { useNavigate, Link } from 'react-router-dom'; // For navigation
import BackgroundWithCards from '../../components/BackgroundWithCards'; // A custom component for the background

// Define the LoginPage component.
const LoginPage = () => {
    // useNavigate is a hook for programmatic navigation.
    const navigate = useNavigate();
    // useState hook to manage the form's data (email and password).
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // useState hooks to manage the UI state.
    const [isSubmitting, setIsSubmitting] = useState(false); // Tracks if the form is currently being submitted.
    const [errors, setErrors] = useState({}); // Stores validation errors for the form fields.
    const [apiError, setApiError] = useState(''); // Stores error messages from the backend API.

    // Destructure email and password from the formData state for easier access.
    const { email, password } = formData;

    // This function is called whenever a form field's value changes.
    const onChange = (e) => {
        const { name, value } = e.target;
        // Update the formData state with the new value.
        setFormData({ ...formData, [name]: value });
        // Clear validation errors for the field when the user starts typing.
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
        // Clear the API error message when the user makes changes.
        if (apiError) {
            setApiError('');
        }
    };

    // This function validates the form data.
    const validateForm = () => {
        const newErrors = {};

        // Basic email and password validation.
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

        if (!password) newErrors.password = 'Password is required';

        // Set the errors state with any new errors.
        setErrors(newErrors);
        // Return true if there are no errors, false otherwise.
        return Object.keys(newErrors).length === 0;
    };

    // This function is called when the form is submitted.
    const onSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior.

        // If the form is not valid, do not proceed with submission.
        if (!validateForm()) return;

        // Set the submitting state to true and clear any previous API errors.
        setIsSubmitting(true);
        setApiError('');

        try {
            // Make a POST request to the login endpoint of the backend API.
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            // Parse the JSON response from the server.
            const data = await response.json();

            // If the response is not successful (e.g., 401 Unauthorized), handle the error.
            if (!response.ok) {
                if (data.message === 'Invalid credentials') {
                    setApiError('Invalid email or password. Please try again.');
                } else {
                    setApiError(data.message || 'Login failed. Please try again.');
                }
                return;
            }

            // If the login is successful, store the JWT and user data in localStorage.
            // This allows the user to stay logged in across sessions.
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect the user to the dashboard page.
            navigate('/dashboard');

        } catch (error) {
            // Handle network errors or other unexpected issues.
            console.error('Login error:', error);
            setApiError('Network error. Please check your connection and try again.');
        } finally {
            // Set the submitting state back to false, regardless of the outcome.
            setIsSubmitting(false);
        }
    };

    // Define animation variants for Framer Motion.
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

    // The JSX that renders the login page.
    return (
        <div className="h-screen flex overflow-hidden relative">
            <BackgroundWithCards />

            {/* The page is split into two halves. */}
            {/* The left side displays the background with cards. */}
            <div className="w-1/2 relative">
                {/* The BackgroundWithCards component handles the visual elements here. */}
            </div>

            {/* The right side contains the login form. */}
            <div className="w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#fafafe' }}>
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative z-10 border border-gray-200"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="text-center mb-8" variants={itemVariants}>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to your account</p>
                    </motion.div>

                    {/* Display the API error message if it exists. */}
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
                        {/* Email input field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your email"
                                required
                            />
                            {/* Display validation error for the email field. */}
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

                        {/* Password input field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your password"
                                required
                            />
                            {/* Display validation error for the password field. */}
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

                        {/* Submit button */}
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
                                {/* Show a loading spinner while submitting. */}
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

                    {/* Link to the registration page. */}
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
                </motion.div>
            </div>
        </div>
    );
};

// Export the component for use in other parts of the application.
export default LoginPage;
 