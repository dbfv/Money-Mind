
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryFields from '../components/Forms/CategoryFields';
import SourceFields from '../components/Forms/SourceFields';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ENDPOINTS } from '../config/api';

const CategoryManagementPage = () => {
    // States for categories
    const [categories, setCategories] = useState([]);
    // Update the category and source form state objects to match the expected structure
    // from CategoryFields and SourceFields components
    const [categoryFormData, setCategoryFormData] = useState({
        categoryName: '',
        categoryType: 'expense',
        description: '',
        color: '#3B82F6' // Default blue color
    });

    // States for sources
    const [sources, setSources] = useState([]);
    // Update the source form data structure
    const [sourceFormData, setSourceFormData] = useState({
        sourceName: '',
        sourceType: 'Bank Account',
        balance: 0,
        interestRate: 0,
        paymentFrequency: 'monthly',
        description: ''
    });

    // UI States
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'sources'
    const [isEditing, setIsEditing] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        onConfirm: () => { },
        type: 'warning'
    });

    // Fetch categories and sources on component mount
    useEffect(() => {
        fetchCategories();
        fetchSources();
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.4 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    const tableRowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (custom) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: custom * 0.05,
                duration: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 20
            }
        }),
        exit: {
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.2 }
        }
    };

    const formVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 25
            }
        }
    };

    const fadeInVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.4 }
        }
    };

    // Function to fetch categories
    const fetchCategories = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(ENDPOINTS.CATEGORIES, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch categories');
            }

            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.message || 'Failed to fetch categories');
        }
    };

    // Function to fetch sources
    const fetchSources = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(ENDPOINTS.SOURCES, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch sources');
            }

            const data = await response.json();
            setSources(data);
        } catch (err) {
            console.error('Error fetching sources:', err);
            setError(err.message || 'Failed to fetch sources');
        }
    };

    // Update the handleCategoryChange function to properly handle input changes from CategoryFields
    const handleCategoryChange = (e) => {
        const { name, value } = e.target;
        setCategoryFormData(prev => ({ ...prev, [name]: value }));
    };

    // Update the handleSourceChange function to properly handle input changes from SourceFields
    const handleSourceChange = (e) => {
        const { name, value } = e.target;
        const newValue = (name === 'balance' || name === 'interestRate')
            ? parseFloat(value) || 0
            : value;
        setSourceFormData(prev => ({ ...prev, [name]: newValue }));
    };

    // Update the handleEdit function to properly set up the form for editing
    const handleEdit = (item) => {
        if (activeTab === 'categories') {
            setCategoryFormData({
                categoryName: item.name,
                categoryType: item.type,
                description: item.description || '',
                color: item.color || '#3B82F6'
            });
        } else {
            setSourceFormData({
                sourceName: item.name,
                sourceType: item.type,
                balance: item.balance || 0,
                interestRate: item.interestRate || 0,
                paymentFrequency: item.paymentFrequency || 'monthly',
                description: item.description || ''
            });
        }

        setIsEditing(true);
        setCurrentItemId(item._id);

        // Scroll to form and ensure it's visible
        document.querySelector('#formSection').scrollIntoView({ behavior: 'smooth' });
    };

    // Update the handleCategorySubmit function to use the correct form fields
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        setFormErrors({});

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Validate form
            const errors = {};
            if (!categoryFormData.categoryName.trim()) {
                errors.categoryName = 'Category name is required';
            }
            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                throw new Error('Please fix the form errors');
            }

            // Prepare the payload with the correct field names
            const categoryPayload = {
                name: categoryFormData.categoryName,
                type: categoryFormData.categoryType,
                description: categoryFormData.description,
                color: categoryFormData.color
            };

            const url = isEditing
                ? `${ENDPOINTS.CATEGORIES}/${currentItemId}`
                : ENDPOINTS.CATEGORIES;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save category');
            }

            // Success
            resetForms();
            await fetchCategories();
            setSuccessMessage(isEditing ? 'Category updated successfully!' : 'Category created successfully!');

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error saving category:', err);
            setError(err.message || 'Failed to save category');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update the handleSourceSubmit function to use the correct form fields
    const handleSourceSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        setFormErrors({});

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Validate form
            const errors = {};
            if (!sourceFormData.sourceName.trim()) {
                errors.sourceName = 'Source name is required';
            }
            if (sourceFormData.balance < 0) {
                errors.balance = 'Balance cannot be negative';
            }
            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                throw new Error('Please fix the form errors');
            }

            // Prepare the payload with the correct field names
            const sourcePayload = {
                name: sourceFormData.sourceName,
                type: sourceFormData.sourceType,
                balance: parseFloat(sourceFormData.balance),
                interestRate: parseFloat(sourceFormData.interestRate) || 0,
                paymentFrequency: sourceFormData.paymentFrequency,
                description: sourceFormData.description
            };

            const url = isEditing
                ? `${ENDPOINTS.SOURCES}/${currentItemId}`
                : ENDPOINTS.SOURCES;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sourcePayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save source');
            }

            // Success
            resetForms();
            await fetchSources();
            setSuccessMessage(isEditing ? 'Source updated successfully!' : 'Source created successfully!');

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error saving source:', err);
            setError(err.message || 'Failed to save source');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update the resetForms function to match the new state structure
    const resetForms = () => {
        setCategoryFormData({
            categoryName: '',
            categoryType: 'expense',
            description: '',
            color: '#3B82F6'
        });
        setSourceFormData({
            sourceName: '',
            sourceType: 'Bank Account',
            balance: 0,
            interestRate: 0,
            paymentFrequency: 'monthly',
            description: ''
        });
        setIsEditing(false);
        setCurrentItemId(null);
        setFormErrors({});
    };

    // Show delete confirmation dialog
    const handleShowDeleteConfirm = (item) => {
        const isCategory = activeTab === 'categories';
        setConfirmDialog({
            isOpen: true,
            title: `Delete ${isCategory ? 'Category' : 'Source'}`,
            message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: () => handleDelete(item._id),
            type: 'danger'
        });
    };

    // Handle item deletion
    const handleDelete = async (id) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const url = activeTab === 'categories'
                ? `${ENDPOINTS.CATEGORIES}/${id}`
                : `${ENDPOINTS.SOURCES}/${id}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete ${activeTab === 'categories' ? 'category' : 'source'}`);
            }

            // Success
            if (activeTab === 'categories') {
                await fetchCategories();
            } else {
                await fetchSources();
            }

            setSuccessMessage(`${activeTab === 'categories' ? 'Category' : 'Source'} deleted successfully!`);

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error(`Error deleting ${activeTab === 'categories' ? 'category' : 'source'}:`, err);
            setError(err.message || `Failed to delete ${activeTab === 'categories' ? 'category' : 'source'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        resetForms();
        setActiveTab(tab);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <motion.div
                className="container mx-auto px-4 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Financial Management</h1>

                    {/* Error message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md"
                            >
                                <p className="text-red-700">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Success message */}
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md"
                            >
                                <p className="text-green-700">{successMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tabs */}
                    <div className="mb-8">
                        <div className="sm:hidden">
                            <select
                                value={activeTab}
                                onChange={(e) => handleTabChange(e.target.value)}
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="categories">Categories</option>
                                <option value="sources">Sources</option>
                            </select>
                        </div>

                        <div className="hidden sm:block">
                            <nav className="flex space-x-4 bg-white p-2 rounded-lg shadow-sm" aria-label="Tabs">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`px-4 py-2 rounded-md font-medium text-sm ${activeTab === 'categories'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                        } transition-colors duration-200`}
                                    onClick={() => handleTabChange('categories')}
                                >
                                    Categories
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`px-4 py-2 rounded-md font-medium text-sm ${activeTab === 'sources'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                        } transition-colors duration-200`}
                                    onClick={() => handleTabChange('sources')}
                                >
                                    Sources
                                </motion.button>
                            </nav>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <motion.div
                            id="formSection"
                            className="lg:col-span-1"
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className={`px-6 py-4 ${activeTab === 'categories'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                    : 'bg-gradient-to-r from-green-500 to-teal-600'
                                    }`}>
                                    <h2 className="text-xl font-semibold text-white">
                                        {isEditing ? `Edit ${activeTab === 'categories' ? 'Category' : 'Source'}` : `New ${activeTab === 'categories' ? 'Category' : 'Source'}`}
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'categories' ? (
                                            <motion.form
                                                key="category-form"
                                                onSubmit={handleCategorySubmit}
                                                className="space-y-6"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <CategoryFields
                                                    values={categoryFormData}
                                                    onChange={handleCategoryChange}
                                                    errors={formErrors}
                                                />

                                                <div className="flex justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={resetForms}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        Cancel
                                                    </button>
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
                                                                {isEditing ? 'Updating...' : 'Creating...'}
                                                            </>
                                                        ) : (
                                                            <>{isEditing ? 'Update Category' : 'Create Category'}</>
                                                        )}
                                                    </button>
                                                </div>
                                            </motion.form>
                                        ) : (
                                            <motion.form
                                                key="source-form"
                                                onSubmit={handleSourceSubmit}
                                                className="space-y-6"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <SourceFields
                                                    values={sourceFormData}
                                                    onChange={handleSourceChange}
                                                    errors={formErrors}
                                                />

                                                <div className="flex justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={resetForms}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                                                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                {isEditing ? 'Updating...' : 'Creating...'}
                                                            </>
                                                        ) : (
                                                            <>{isEditing ? 'Update Source' : 'Create Source'}</>
                                                        )}
                                                    </button>
                                                </div>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>

                        {/* Table Section */}
                        <div className="lg:col-span-2">
                            <AnimatePresence mode="wait">
                                {activeTab === 'categories' ? (
                                    <motion.div
                                        key="categories-table"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="bg-white rounded-lg shadow-md overflow-hidden"
                                    >
                                        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                                            <h2 className="text-xl font-semibold text-white">Categories List</h2>
                                        </div>

                                        <div className="p-6">
                                            {categories.length === 0 ? (
                                                <motion.p
                                                    variants={fadeInVariants}
                                                    className="text-gray-500 text-center py-8"
                                                >
                                                    No categories found. Create one to get started.
                                                </motion.p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            <AnimatePresence>
                                                                {categories.map((category, index) => (
                                                                    <motion.tr
                                                                        key={category._id}
                                                                        variants={tableRowVariants}
                                                                        initial="hidden"
                                                                        animate="visible"
                                                                        exit="exit"
                                                                        custom={index}
                                                                        className="hover:bg-gray-50"
                                                                    >
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{category.type}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="flex items-center">
                                                                                <div
                                                                                    className="w-6 h-6 rounded-full mr-2"
                                                                                    style={{ backgroundColor: category.color || '#3B82F6' }}
                                                                                ></div>
                                                                                <span className="text-sm text-gray-500">{category.color || '#3B82F6'}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                            <div className="flex justify-end space-x-2">
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.05 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    onClick={() => handleEdit(category)}
                                                                                    className="text-blue-600 hover:text-blue-800"
                                                                                >
                                                                                    Edit
                                                                                </motion.button>
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.05 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    onClick={() => handleShowDeleteConfirm(category)}
                                                                                    className="text-red-600 hover:text-red-800"
                                                                                >
                                                                                    Delete
                                                                                </motion.button>
                                                                            </div>
                                                                        </td>
                                                                    </motion.tr>
                                                                ))}
                                                            </AnimatePresence>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="sources-table"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="bg-white rounded-lg shadow-md overflow-hidden"
                                    >
                                        <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-teal-600">
                                            <h2 className="text-xl font-semibold text-white">Sources List</h2>
                                        </div>

                                        <div className="p-6">
                                            {sources.length === 0 ? (
                                                <motion.p
                                                    variants={fadeInVariants}
                                                    className="text-gray-500 text-center py-8"
                                                >
                                                    No sources found. Create one to get started.
                                                </motion.p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            <AnimatePresence>
                                                                {sources.map((source, index) => (
                                                                    <motion.tr
                                                                        key={source._id}
                                                                        variants={tableRowVariants}
                                                                        initial="hidden"
                                                                        animate="visible"
                                                                        exit="exit"
                                                                        custom={index}
                                                                        className="hover:bg-gray-50"
                                                                    >
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{source.name}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{source.type}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            ${source.balance.toFixed(2)}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                            <div className="flex justify-end space-x-2">
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.05 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    onClick={() => handleEdit(source)}
                                                                                    className="text-blue-600 hover:text-blue-800"
                                                                                >
                                                                                    Edit
                                                                                </motion.button>
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.05 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    onClick={() => handleShowDeleteConfirm(source)}
                                                                                    className="text-red-600 hover:text-red-800"
                                                                                >
                                                                                    Delete
                                                                                </motion.button>
                                                                            </div>
                                                                        </td>
                                                                    </motion.tr>
                                                                ))}
                                                            </AnimatePresence>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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

export default CategoryManagementPage; 