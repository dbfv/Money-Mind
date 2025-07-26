import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../config/api';
import Header from './Header';
import TabNavigation from './TabNavigation';
import CategoryTable from './components/CategoryTable';
import SourceTable from './components/SourceTable';
import CategoryForm from './components/CategoryForm';
import SourceForm from './components/SourceForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const ManagementPage = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [sources, setSources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        categoryName: '',
        categoryType: 'expense',
        description: ''
    });
    const [sourceForm, setSourceForm] = useState({
        sourceName: '',
        sourceType: 'Bank Account',
        balance: 0,
        interestRate: 0,
        paymentFrequency: 'monthly'
    });
    const [editingItem, setEditingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!token) {
            setError('You must be logged in to access this page. Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        }
    }, [token, navigate]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(ENDPOINTS.CATEGORIES, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data);
        } catch (e) {
            setError(e.message);
        }
    };

    const fetchSources = async () => {
        try {
            const res = await fetch(ENDPOINTS.SOURCES, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch sources');
            const data = await res.json();
            setSources(data);
        } catch (e) {
            setError(e.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([fetchCategories(), fetchSources()]);
            setIsLoading(false);
        };
        fetchData();
    }, [token]);

    const handleEdit = (item, type) => {
        if (type === 'category') {
            setCategoryForm({
                categoryName: item.name,
                categoryType: item.type,
                description: item.description || ''
            });
        } else {
            setSourceForm({
                sourceName: item.name,
                sourceType: item.type.toLowerCase(),
                balance: item.balance || 0,
                interestRate: item.interestRate || 0,
                paymentFrequency: item.paymentFrequency || 'monthly'
            });
        }
        setEditingItem(item);
        setShowForm(true);
    };

    const validateSourceForm = () => {
        const errors = {};
        if (!sourceForm.sourceName.trim()) {
            errors.sourceName = 'Source name is required';
        }
        if (!sourceForm.sourceType) {
            errors.sourceType = 'Source type is required';
        }
        if (sourceForm.balance < 0) {
            errors.balance = 'Balance cannot be negative';
        }
        if (sourceForm.interestRate < 0) {
            errors.interestRate = 'Interest rate cannot be negative';
        }
        return errors;
    };

    const validateCategoryForm = () => {
        const errors = {};
        if (!categoryForm.categoryName.trim()) {
            errors.categoryName = 'Category name is required';
        }
        if (!categoryForm.categoryType) {
            errors.categoryType = 'Category type is required';
        }
        return errors;
    };

    const handleSourceSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateSourceForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const url = editingItem
                ? `${ENDPOINTS.SOURCES}/${editingItem._id}`
                : ENDPOINTS.SOURCES;

            const method = editingItem ? 'PUT' : 'POST';

            const sourceData = {
                name: sourceForm.sourceName.trim(),
                type: sourceForm.sourceType,
                balance: parseFloat(sourceForm.balance),
                interestRate: parseFloat(sourceForm.interestRate),
                paymentFrequency: sourceForm.paymentFrequency
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sourceData)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || `Failed to ${editingItem ? 'update' : 'create'} source`);
            }

            await fetchSources();
            setSourceForm({
                sourceName: '',
                sourceType: 'Bank Account',
                balance: 0,
                interestRate: 0,
                paymentFrequency: 'monthly'
            });
            setShowForm(false);
            setEditingItem(null);
            setErrors({});
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateCategoryForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const url = editingItem
                ? `${ENDPOINTS.CATEGORIES}/${editingItem._id}`
                : ENDPOINTS.CATEGORIES;

            const method = editingItem ? 'PUT' : 'POST';

            const categoryData = {
                name: categoryForm.categoryName.trim(),
                type: categoryForm.categoryType,
                description: categoryForm.description
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryData)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || `Failed to ${editingItem ? 'update' : 'create'} category`);
            }

            await fetchCategories();
            setCategoryForm({ categoryName: '', categoryType: 'expense', description: '' });
            setShowForm(false);
            setEditingItem(null);
            setErrors({});
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id, type) => {
        setItemToDelete(id);
        setDeleteType(type);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete || !deleteType) return;

        try {
            const endpoint = deleteType === 'category' ? ENDPOINTS.CATEGORIES : ENDPOINTS.SOURCES;
            const res = await fetch(`${endpoint}/${itemToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`Failed to delete ${deleteType}`);

            if (deleteType === 'category') {
                await fetchCategories();
            } else {
                await fetchSources();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setShowForm(false);
    };

    return (
        <div className="pt-16 p-8">
            <div className="max-w-7xl mx-auto">
                <Header error={error} />
                <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

                {/* Content */}
                <div className="flex gap-6">
                    {/* Table Section */}
                    <motion.div
                        className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${showForm ? 'w-2/3' : 'w-full'}`}
                        layout
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {activeTab === 'categories' ? (
                            <CategoryTable
                                categories={categories}
                                onEdit={(category) => handleEdit(category, 'category')}
                                onDelete={(id) => handleDeleteClick(id, 'category')}
                                onAdd={() => {
                                    setCategoryForm({ categoryName: '', categoryType: 'expense', description: '' });
                                    setEditingItem(null);
                                    setShowForm(true);
                                }}
                                showForm={showForm}
                            />
                        ) : (
                            <SourceTable
                                sources={sources}
                                onEdit={(source) => handleEdit(source, 'source')}
                                onDelete={(id) => handleDeleteClick(id, 'source')}
                                onAdd={() => {
                                    setSourceForm({
                                        sourceName: '',
                                        sourceType: 'Bank Account',
                                        balance: 0,
                                        interestRate: 0,
                                        paymentFrequency: 'monthly'
                                    });
                                    setEditingItem(null);
                                    setShowForm(true);
                                }}
                                showForm={showForm}
                            />
                        )}
                    </motion.div>

                    {/* Form Section */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="w-1/3 bg-white rounded-xl shadow-lg border border-gray-200 p-6"
                            >
                                {activeTab === 'categories' ? (
                                    <CategoryForm
                                        values={categoryForm}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value })}
                                        onSubmit={handleCategorySubmit}
                                        onClose={() => setShowForm(false)}
                                        isEditing={!!editingItem}
                                        isSubmitting={isSubmitting}
                                        errors={errors}
                                    />
                                ) : (
                                    <SourceForm
                                        values={sourceForm}
                                        onChange={(e) => setSourceForm({ ...sourceForm, [e.target.name]: e.target.value })}
                                        onSubmit={handleSourceSubmit}
                                        onClose={() => setShowForm(false)}
                                        isEditing={!!editingItem}
                                        isSubmitting={isSubmitting}
                                        errors={errors}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Confirmation Dialog */}
                <ConfirmationDialog
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                    title={`Delete ${deleteType ? deleteType.charAt(0).toUpperCase() + deleteType.slice(1) : 'Item'}`}
                    message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    type="danger"
                />
            </div>
        </div>
    );
};

export default ManagementPage; 