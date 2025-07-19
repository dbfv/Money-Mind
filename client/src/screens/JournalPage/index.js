import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Dropdown from '../../components/Dropdown';
import GradientButton from '../../components/GradientButton';

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
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const [transactionsError, setTransactionsError] = useState(null);

    // Check URL for showForm parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('showForm') === 'true') {
            setShowForm(true);
        }
    }, [location]);

    // Mock categories and sources - in real app, these would come from API
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

    useEffect(() => {
        // Fetch real types from backend
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/types', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch types');
                const data = await res.json();
                setCategories(data);
            } catch (e) {
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Fetch transactions
    const fetchTransactions = async () => {
        setIsLoadingTransactions(true);
        setTransactionsError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/transactions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch transactions');
            const data = await res.json();
            setTransactions(data);
        } catch (e) {
            setTransactionsError(e.message);
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
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
                fetchTransactions(); // Refetch transactions after adding
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Transactions Table (2/3 width) */}
                    <div className="md:col-span-2">
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
                            </motion.div>
                            {/* Journal Table Content */}
                            <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200" variants={itemVariants}>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">Transaction Journal</div>
                                    <GradientButton
                                        onClick={() => setShowForm(true)}
                                        icon="➕"
                                    >
                                        Add Transaction
                                    </GradientButton>
                                </div>
                                {/* Transactions List */}
                                <div className="mt-8 overflow-x-auto">
                                    {isLoadingTransactions ? (
                                        <div className="text-gray-500">Loading transactions...</div>
                                    ) : transactionsError ? (
                                        <div className="text-red-500">{transactionsError}</div>
                                    ) : transactions.length === 0 ? (
                                        <div className="text-gray-400">No transactions found.</div>
                                    ) : (
                                        <table className="w-full mt-4 text-left border-t">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="py-2 px-2">Date</th>
                                                    <th className="py-2 px-2">Type</th>
                                                    <th className="py-2 px-2">Amount</th>
                                                    <th className="py-2 px-2">Description</th>
                                                    <th className="py-2 px-2">Category</th>
                                                    <th className="py-2 px-2">Source</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((t) => (
                                                    <tr key={t._id} className="border-b hover:bg-gray-50">
                                                        <td className="py-2 px-2">{new Date(t.date).toLocaleDateString()}</td>
                                                        <td className="py-2 px-2 capitalize">{t.type}</td>
                                                        <td className={`py-2 px-2 font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}</td>
                                                        <td className="py-2 px-2">{t.description}</td>
                                                        <td className="py-2 px-2">{typeof t.category === 'object' && t.category !== null ? t.category.name : t.category}</td>
                                                        <td className="py-2 px-2">{t.source?.name || t.source}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                    {/* Right: Sources List (1/3 width) */}
                    <div>
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                            <div className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>💳</span> All Sources
                            </div>
                            {sources.length === 0 ? (
                                <div className="text-gray-400">No sources found.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {sources.map((src) => (
                                        <li key={src._id} className="border rounded-lg p-4 flex flex-col gap-1 bg-gray-50 hover:bg-gray-100 transition">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-800">{src.name}</span>
                                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{src.type}</span>
                                            </div>
                                            <div className="text-gray-600 text-sm">Balance: <span className="font-bold">${parseFloat(src.balance).toLocaleString()}</span></div>
                                            <div className="text-gray-500 text-xs">Status: {src.status}</div>
                                            {src.interestRate && (
                                                <div className="text-gray-500 text-xs">Interest: {src.interestRate}% {src.interestPeriod ? `(${src.interestPeriod})` : ''}</div>
                                            )}
                                            {src.transferTime && (
                                                <div className="text-gray-500 text-xs">Wait: {src.transferTime}</div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                {/* Transaction Form Overlay (unchanged) */}
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
                                className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar"
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
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            options={categories.map(c => ({ value: c._id, label: c.name }))}
                                            error={errors.category}
                                            placeholder="Select a type"
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
                                            <GradientButton
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                                            >
                                                {isSubmitting ? 'Saving...' : 'Save Transaction'}
                                            </GradientButton>
                                        </div>
                                    </form>
                                </div>
                            </motion.div >
                        </motion.div >
                    )}
                </AnimatePresence >
            </div>
        </div>
    );
};

export default JournalPage; 