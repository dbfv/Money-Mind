import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ManagementPage = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [sources, setSources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        type: 'expense',
    });
    const [sourceForm, setSourceForm] = useState({
        name: '',
        type: 'Bank Account',
        balance: 0,
        status: 'Available',
        interestRate: 0,
        transferTime: 'Instant',
    });
    const [editingItem, setEditingItem] = useState(null);

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
            const res = await fetch('http://localhost:5000/api/types', {
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
            const res = await fetch('http://localhost:5000/api/sources', {
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
                name: item.name,
                type: item.type
            });
        } else {
            setSourceForm({
                name: item.name,
                type: item.type,
                balance: item.balance,
                status: item.status,
                interestRate: item.interestRate || 0,
                transferTime: item.transferTime || 'Instant',
            });
        }
        setEditingItem(item);
        setShowForm(true);
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem
                ? `http://localhost:5000/api/types/${editingItem._id}`
                : 'http://localhost:5000/api/types';

            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryForm)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to ${editingItem ? 'update' : 'create'} category`);
            }

            await fetchCategories();
            setCategoryForm({ name: '', type: 'expense' });
            setShowForm(false);
            setEditingItem(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSourceSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem
                ? `http://localhost:5000/api/sources/${editingItem._id}`
                : 'http://localhost:5000/api/sources';

            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sourceForm)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to ${editingItem ? 'update' : 'create'} source`);
            }

            await fetchSources();
            setSourceForm({
                name: '',
                type: 'Bank Account',
                balance: 0,
                status: 'Available',
                interestRate: 0,
                transferTime: 'Instant',
            });
            setShowForm(false);
            setEditingItem(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const endpoint = type === 'category' ? 'types' : 'sources';
            const res = await fetch(`http://localhost:5000/api/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`Failed to delete ${type}`);

            if (type === 'category') {
                await fetchCategories();
            } else {
                await fetchSources();
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="pt-16 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Management Dashboard</h1>
                    <button
                        onClick={() => navigate('/journal')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        ← Back to Journal
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => {
                            setActiveTab('categories');
                            setShowForm(false);
                        }}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'categories'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Categories
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('sources');
                            setShowForm(false);
                        }}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'sources'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Sources
                    </button>
                </div>

                {/* Content */}
                <div className="flex gap-6">
                    {/* Table Section */}
                    <motion.div
                        className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${showForm ? 'w-2/3' : 'w-full'}`}
                        layout
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {activeTab === 'categories' ? (
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                                    {!showForm && (
                                        <button
                                            onClick={() => {
                                                setCategoryForm({ name: '', type: 'expense' });
                                                setEditingItem(null);
                                                setShowForm(true);
                                            }}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Add Category
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {categories.map(category => (
                                                <tr key={category._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {category.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {category.type === 'expense' ? '💸 Expense' : '💰 Income'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                        <button
                                                            onClick={() => handleEdit(category, 'category')}
                                                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                                        >
                                                            <span className="text-xs mr-1">✏️</span>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category._id, 'category')}
                                                            className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                        >
                                                            <span className="text-xs mr-1">🗑️</span>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Sources</h2>
                                    {!showForm && (
                                        <button
                                            onClick={() => {
                                                setSourceForm({
                                                    name: '',
                                                    type: 'Bank Account',
                                                    balance: 0,
                                                    status: 'Available',
                                                    interestRate: 0,
                                                    transferTime: 'Instant',
                                                });
                                                setEditingItem(null);
                                                setShowForm(true);
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Add Source
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {sources.map(source => (
                                                <tr key={source._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {source.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {source.type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        ${source.balance.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {source.status}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                        <button
                                                            onClick={() => handleEdit(source, 'source')}
                                                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                                        >
                                                            <span className="text-xs mr-1">✏️</span>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(source._id, 'source')}
                                                            className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                        >
                                                            <span className="text-xs mr-1">🗑️</span>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
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
                                    <>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {editingItem ? 'Edit' : 'Add'} Category
                                            </h2>
                                            <button
                                                onClick={() => setShowForm(false)}
                                                className="text-gray-500 hover:text-gray-700 text-xl"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Category Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={categoryForm.name}
                                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="Enter category name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Type *
                                                </label>
                                                <select
                                                    value={categoryForm.type}
                                                    onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    <option value="expense">Expense 💸</option>
                                                    <option value="income">Income 💰</option>
                                                </select>
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                {editingItem ? 'Update' : 'Add'} Category
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {editingItem ? 'Edit' : 'Add'} Source
                                            </h2>
                                            <button
                                                onClick={() => setShowForm(false)}
                                                className="text-gray-500 hover:text-gray-700 text-xl"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <form onSubmit={handleSourceSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Source Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={sourceForm.name}
                                                    onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter source name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Type *
                                                </label>
                                                <select
                                                    value={sourceForm.type}
                                                    onChange={(e) => setSourceForm({ ...sourceForm, type: e.target.value })}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="Bank Account">Bank Account</option>
                                                    <option value="E-Wallet">E-Wallet</option>
                                                    <option value="Cash">Cash</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Balance *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={sourceForm.balance}
                                                    onChange={(e) => setSourceForm({ ...sourceForm, balance: parseFloat(e.target.value) })}
                                                    required
                                                    step="0.01"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Status *
                                                </label>
                                                <select
                                                    value={sourceForm.status}
                                                    onChange={(e) => setSourceForm({ ...sourceForm, status: e.target.value })}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="Available">Available</option>
                                                    <option value="Locked">Locked</option>
                                                    <option value="Not Available">Not Available</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Interest Rate (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={sourceForm.interestRate}
                                                    onChange={(e) => setSourceForm({ ...sourceForm, interestRate: parseFloat(e.target.value) })}
                                                    step="0.01"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Transfer Time
                                                </label>
                                                <input
                                                    type="text"
                                                    value={sourceForm.transferTime}
                                                    onChange={(e) => setSourceForm({ ...sourceForm, transferTime: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="e.g., Instant, 1-2 days"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                {editingItem ? 'Update' : 'Add'} Source
                                            </button>
                                        </form>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ManagementPage; 