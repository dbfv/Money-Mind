import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../config/api';
import Header from './components/Header';
import TransactionTable from './components/TransactionTable';
import SourcesList from './components/SourcesList';
import TransactionForm from './components/TransactionForm';
import CategoryForm from './components/CategoryForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';

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
    const [showCategoryDeleteDialog, setShowCategoryDeleteDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Check URL for showForm parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('showForm') === 'true') {
            setShowForm(true);
        }
    }, [location]);

    // Fetch sources
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

    useEffect(() => {
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

        // Check if this is an expense and if there's enough balance in the source
        const selectedCategory = categories.find(c => c._id === formData.category);
        const selectedSource = sources.find(s => s._id === formData.source);

        if (selectedCategory && selectedSource && selectedCategory.type === 'expense') {
            const amount = parseFloat(formData.amount);

            // Check if creating a new expense would exceed source balance
            if (selectedSource.balance < amount) {
                newErrors.amount = `Insufficient funds in ${selectedSource.name}. Available: $${selectedSource.balance.toFixed(2)}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEdit = (transaction) => {
        setFormData({
            amount: transaction.amount.toString(),
            date: new Date(transaction.date).toISOString().split('T')[0],
            description: transaction.description,
            category: transaction.category ? (transaction.category._id || transaction.category) : '',
            source: transaction.source ? (transaction.source._id || transaction.source) : '',
            type: transaction.type
        });
        setEditingItem(transaction);
        setShowForm(true);
    };

    const handleDelete = async (transaction) => {
        try {
            const token = localStorage.getItem('token');
            const userData = JSON.parse(localStorage.getItem('user'));
            const userId = userData?._id;

            console.log('Deleting transaction:', transaction._id);

            const res = await fetch(`${ENDPOINTS.TRANSACTIONS}/${transaction._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: userId }) // Include userId in the request body
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Failed to delete transaction' }));
                console.error('Delete transaction response:', res.status, errorData);
                throw new Error(errorData.message || 'Failed to delete transaction');
            }

            // Only update the UI if the delete was successful
            await fetchTransactions();
            await fetchSources(); // Also refresh sources to show updated balances
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
            const userData = JSON.parse(localStorage.getItem('user'));
            const userId = userData?._id;

            if (!userId) {
                throw new Error('User ID not found. Please login again.');
            }

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
                    source: formData.source,
                    userId: userId
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                console.error('Transaction submission error:', data);
                setErrors({ submit: data.message || `Failed to ${editingItem ? 'update' : 'create'} transaction` });
                return;
            }

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
            await fetchTransactions(); // Refetch transactions after adding/updating
            await fetchSources(); // Also refresh sources to show updated balances
        } catch (error) {
            console.error('Transaction submission error:', error);
            setErrors({ submit: error.message || 'Network error. Please try again.' });
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

            const responseData = await res.json();
            if (!res.ok) {
                throw new Error(responseData.message || 'Failed to create category');
            }

            setCategories(prev => [...prev, responseData]);
            e.target.reset();
            setCategoryFormError(null);
        } catch (error) {
            setCategoryFormError(error.message);
            console.error('Error creating category:', error);
        }
    };

    const handleCategoryDeleteClick = (categoryId) => {
        setCategoryToDelete(categoryId);
        setShowCategoryDeleteDialog(true);
    };

    const handleCategoryDelete = async () => {
        if (!categoryToDelete) return;
        try {
            const res = await fetch(`${ENDPOINTS.CATEGORIES}/${categoryToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete category');
            setCategories(prev => prev.filter(c => c._id !== categoryToDelete));
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { 
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    // Add a helper function to show source balance information
    const getSourceBalanceInfo = () => {
        if (!formData.source) return null;

        const selectedSource = sources.find(s => s._id === formData.source);
        if (!selectedSource) return null;

        const selectedCategory = categories.find(c => c._id === formData.category);
        const isExpense = selectedCategory?.type === 'expense';

        return (
            <div className="mt-1 text-sm">
                {isExpense ? (
                    <span className="text-blue-600">
                        Available balance: ${selectedSource.balance.toFixed(2)}
                    </span>
                ) : (
                    <span className="text-gray-500">
                        Current balance: ${selectedSource.balance.toFixed(2)}
                    </span>
                )}
            </div>
        );
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
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <SourcesList sources={sources} />
                    </motion.div>
                </div>

                {/* Category Form Modal */}
                <CategoryForm
                    showForm={showCategoryForm}
                    onClose={() => setShowCategoryForm(false)}
                    categories={categories}
                    onSubmit={handleCategorySubmit}
                    onDelete={handleCategoryDeleteClick}
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
                    getSourceBalanceInfo={getSourceBalanceInfo} // Pass the helper function
                />
            </div>

            {/* Category Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showCategoryDeleteDialog}
                onClose={() => setShowCategoryDeleteDialog(false)}
                onConfirm={handleCategoryDelete}
                title="Delete Category"
                message="Are you sure you want to delete this category? This will not delete associated transactions, but they will no longer be categorized."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default JournalPage; 