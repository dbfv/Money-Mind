import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ENDPOINTS } from '../../../config/api';

const UserDetails = ({ user, onBack, showToast }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPagination, setTransactionPagination] = useState({});

  useEffect(() => {
    fetchUserDetails();
    fetchUserTransactions();
    fetchUserCategories();
    fetchUserSources();
  }, [user._id]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('firebaseToken');
      const response = await fetch(`/api/admin/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showToast('Failed to fetch user details', 'error');
    }
  };

  const fetchUserTransactions = async (page = 1) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('firebaseToken');
      const response = await fetch(`/api/admin/users/${user._id}/transactions?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions(data.transactions);
      setTransactionPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast('Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCategories = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('firebaseToken');
      const response = await fetch(`/api/admin/users/${user._id}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserSources = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('firebaseToken');
      const response = await fetch(`/api/admin/users/${user._id}/sources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch sources');
      
      const data = await response.json();
      setSources(data.sources);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Delete category "${categoryName}"?`)) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('firebaseToken');
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete category');
      
      showToast(`Category "${categoryName}" deleted`, 'success');
      fetchUserCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const handleDeleteSource = async (sourceId, sourceName) => {
    if (!window.confirm(`Delete source "${sourceName}"?`)) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('firebaseToken');
      const response = await fetch(`/api/admin/sources/${sourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete source');
      
      showToast(`Source "${sourceName}" deleted`, 'success');
      fetchUserSources();
    } catch (error) {
      console.error('Error deleting source:', error);
      showToast('Failed to delete source', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'sources', label: 'Sources', icon: '🏦' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          ← Back to Users
        </button>
      </div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="flex items-center space-x-4">
          {user.avatar ? (
            <img className="h-16 w-16 rounded-full" src={user.avatar} alt="" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xl font-medium text-gray-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">Age: {user.age}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.role === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
              <span className="text-sm text-gray-500">
                Joined: {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      {userDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Transactions</div>
            <div className="text-2xl font-bold text-gray-900">
              {userDetails.stats.transactions.reduce((sum, t) => sum + t.count, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Categories</div>
            <div className="text-2xl font-bold text-gray-900">{userDetails.stats.categoriesCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Sources</div>
            <div className="text-2xl font-bold text-gray-900">{userDetails.stats.sourcesCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Risk Tolerance</div>
            <div className="text-2xl font-bold text-gray-900">
              {userDetails.user.investmentProfile?.riskTolerance || 'N/A'}%
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && userDetails && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Transaction Summary</h3>
            <div className="space-y-2">
              {userDetails.stats.transactions.map((stat) => (
                <div key={stat._id} className="flex justify-between">
                  <span className="capitalize">{stat._id}:</span>
                  <span>{stat.count} transactions, {formatCurrency(stat.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transactionPagination.pages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Page {transactionPagination.current} of {transactionPagination.pages}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setTransactionPage(Math.max(1, transactionPage - 1));
                        fetchUserTransactions(Math.max(1, transactionPage - 1));
                      }}
                      disabled={transactionPage === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setTransactionPage(Math.min(transactionPagination.pages, transactionPage + 1));
                        fetchUserTransactions(Math.min(transactionPagination.pages, transactionPage + 1));
                      }}
                      disabled={transactionPage === transactionPagination.pages}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Categories ({categories.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {categories.map((category) => (
                <div key={category._id} className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">
                        {category.type} • {category.sixJarsCategory}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category._id, category.name)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Sources ({sources.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {sources.map((source) => (
                <div key={source._id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{source.name}</div>
                    <div className="text-sm text-gray-500">{source.type}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteSource(source._id, source.name)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserDetails;