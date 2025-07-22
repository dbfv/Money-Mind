import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../config/api';
import Header from './components/Header';
import TransactionTable from './components/TransactionTable';
import SourcesList from './components/SourcesList';
import TransactionForm from './components/TransactionForm';
import CategoryForm from './components/CategoryForm';

const JournalPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        source: ''
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [sources, setSources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const [transactionsError, setTransactionsError] = useState(null);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [categoryFormError, setCategoryFormError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    // Check URL for showForm parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('showForm') === 'true') {
            setShowForm(true);
        }
    }, [location]);

    // Fetch sources
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(ENDPOINTS.SOURCES, {
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

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(ENDPOINTS.CATEGORIES, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch categories');
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
            const res = await fetch(ENDPOINTS.TRANSACTIONS, {
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

    const handleEdit = (transaction) => {
        setFormData({
            amount: transaction.amount.toString(),
            date: new Date(transaction.date).toISOString().split('T')[0],
            description: transaction.description,
            category: transaction.category._id || transaction.category,
            source: transaction.source._id || transaction.source,
            type: transaction.type
        });
        setEditingItem(transaction);
        setShowForm(true);
    };

    const handleDelete = async (transaction) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${ENDPOINTS.TRANSACTIONS}/${transaction._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Failed to delete transaction' }));
                throw new Error(errorData.message || 'Failed to delete transaction');
            }

            // Only update the UI if the delete was successful
            await fetchTransactions();
            setError(null); // Clear any previous errors
        } catch (error) {
            setError(error.message);
            console.error('Error deleting transaction:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const url = editingItem
                ? `${ENDPOINTS.TRANSACTIONS}/${editingItem._id}`
                : ENDPOINTS.TRANSACTIONS;

            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    type: categories.find(c => c._id === formData.category)?.type || 'expense',
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
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    category: '',
                    source: ''
                });
                setShowForm(false);
                setEditingItem(null);
                // Remove the showForm parameter from URL
                navigate('/journal');
                fetchTransactions(); // Refetch transactions after adding/updating
            } else {
                const data = await response.json();
                setErrors({ submit: data.message || `Failed to ${editingItem ? 'update' : 'create'} transaction` });
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

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const categoryData = {
            name: formData.get('name'),
            type: formData.get('type')
        };

        try {
            setCategoryFormError(null);
            const res = await fetch(ENDPOINTS.CATEGORIES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(categoryData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to create category');
            }

            const newCategory = await res.json();
            setCategories(prev => [...prev, newCategory]);
            e.target.reset();
            setCategoryFormError(null);
        } catch (error) {
            setCategoryFormError(error.message);
            console.error('Error creating category:', error);
        }
    };

    const handleCategoryDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const res = await fetch(`${ENDPOINTS.CATEGORIES}/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete category');
            setCategories(prev => prev.filter(c => c._id !== categoryId));
        } catch (error) {
            console.error('Error deleting category:', error);
        }
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
                            <Header onAddTransaction={() => {
                                setFormData({
                                    amount: '',
                                    date: new Date().toISOString().split('T')[0],
                                    description: '',
                                    category: '',
                                    source: ''
                                });
                                setEditingItem(null);
                                setShowForm(true);
                            }} />

                            {/* Journal Table Content */}
                            <TransactionTable
                                transactions={transactions}
                                isLoading={isLoadingTransactions}
                                error={transactionsError}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </motion.div>
                    </div>

                    {/* Right: Sources List (1/3 width) */}
                    <div>
                        <SourcesList sources={sources} />
                    </div>
                </div>

                {/* Category Form Modal */}
                <CategoryForm
                    showForm={showCategoryForm}
                    onClose={() => setShowCategoryForm(false)}
                    categories={categories}
                    onSubmit={handleCategorySubmit}
                    onDelete={handleCategoryDelete}
                    error={categoryFormError}
                />

                {/* Transaction Form Modal */}
                <TransactionForm
                    showForm={showForm}
                    onClose={closeForm}
                    formData={formData}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    categories={categories}
                    sources={sources}
                />
            </div>
        </div>
    );
};

export default JournalPage; 