import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Dropdown from '../../components/Dropdown';

const JournalPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        source: ''
    });
    const [errors, setErrors] = useState({});
    const [sources, setSources] = useState([]);

    // Check URL for showForm parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('showForm') === 'true') {
            setShowForm(true);
        }
    }, [location]);

    // Mock categories and sources - in real app, these would come from API
    const categories = [
        { _id: '1', name: 'Housing' },
        { _id: '2', name: 'Food' },
        { _id: '3', name: 'Transport' },
        { _id: '4', name: 'Entertainment' },
        { _id: '5', name: 'Utilities' },
        { _id: '6', name: 'Healthcare' },
        { _id: '7', name: 'Shopping' },
        { _id: '8', name: 'Other' }
    ];

    useEffect(() => {
        // Fetch real sources from backend
        const fetchSources = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/sources', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch sources');
                const data = await res.json();
                setSources(data);
            } catch (e) {
                setSources([]);
            }
        };
        fetchSources();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.amount) newErrors.amount = 'Amount is required';
        else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be a positive number';
        }

        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.source) newErrors.source = 'Source is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    type: formData.type,
                    date: new Date(formData.date),
                    description: formData.description,
                    category: formData.category,
                    source: formData.source
                }),
            });

            if (response.ok) {
                // Reset form and close
                setFormData({
                    amount: '',
                    type: 'expense',
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    category: '',
                    source: ''
                });
                setShowForm(false);
                // Remove the showForm parameter from URL
                navigate('/journal');
            } else {
                const data = await response.json();
                setErrors({ submit: data.message || 'Failed to create transaction' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setErrors({});
        navigate('/journal');
    };

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

    const formVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.2 }
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
                    <motion.div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between" variants={itemVariants}>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal</h1>
                            <p className="text-gray-600">Track your financial transactions and insights.</p>
                        </div>
                        <motion.button
                            className="mt-4 md:mt-0 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/sources')}
                        >
                            Manage Sources
                        </motion.button>
                    </motion.div>

                    {/* Journal Content */}
                    <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200" variants={itemVariants}>
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Transaction Journal</h2>
                            <p className="text-gray-600 mb-6">Your financial transactions will appear here.</p>
                            <motion.button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowForm(true)}
                            >
                                <span className="mr-2">➕</span>
                                Add Transaction
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Transaction Form Overlay */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeForm}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Add Transaction</h2>
                                    <button
                                        onClick={closeForm}
                                        className="text-gray-500 hover:text-gray-700 text-xl"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount *
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                        {errors.amount && (
                                            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                                        )}
                                    </div>

                                    {/* Type */}
                                    <Dropdown
                                        label="Type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        options={[
                                            { value: 'expense', label: 'Expense' },
                                            { value: 'income', label: 'Income' }
                                        ]}
                                        error={errors.type}
                                        placeholder="Select type"
                                        required
                                    />

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter description"
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <Dropdown
                                        label="Category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        options={categories.map(c => ({ value: c._id, label: c.name }))}
                                        error={errors.category}
                                        placeholder="Select a category"
                                        required
                                    />

                                    {/* Source */}
                                    <Dropdown
                                        label="Source"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleInputChange}
                                        options={sources.map(s => ({ value: s._id, label: s.name }))}
                                        error={errors.source}
                                        placeholder="Select a source"
                                        required
                                    />

                                    {/* Submit Error */}
                                    {errors.submit && (
                                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                            {errors.submit}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex space-x-3 pt-4">
                                        <motion.button
                                            type="button"
                                            onClick={closeForm}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ duration: 0.1 }}
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 ${isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                                }`}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ duration: 0.1 }}
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Creating...
                                                </div>
                                            ) : (
                                                'Create Transaction'
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div >
                    </motion.div >
                )}
            </AnimatePresence >
        </div >
    );
};

export default JournalPage; 