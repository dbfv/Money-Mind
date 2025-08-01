import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ConfirmationDialog from '../../../components/ConfirmationDialog';

const TransactionTable = ({ transactions, isLoading, error, onEdit, onDelete, onBulkDelete }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [bulkDeleteType, setBulkDeleteType] = useState(null);

    const handleDeleteClick = (transaction) => {
        setTransactionToDelete(transaction);
        setShowConfirmDialog(true);
    };

    const handleConfirmDelete = () => {
        if (transactionToDelete) {
            onDelete(transactionToDelete);
        }
        setShowConfirmDialog(false);
        setTransactionToDelete(null);
    };

    const handleBulkDeleteClick = (type) => {
        setBulkDeleteType(type);
        setShowBulkDeleteDialog(true);
    };

    const handleConfirmBulkDelete = () => {
        if (bulkDeleteType && onBulkDelete) {
            onBulkDelete(bulkDeleteType);
        }
        setShowBulkDeleteDialog(false);
        setBulkDeleteType(null);
    };

    const expenseCount = transactions.filter(t => t.type === 'expense').length;
    const incomeCount = transactions.filter(t => t.type === 'income').length;

    return (
        <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">Transaction Journal</div>
                <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                    {expenseCount > 0 && (
                        <button
                            onClick={() => handleBulkDeleteClick('expense')}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                            title={`Delete all ${expenseCount} expense transactions`}
                        >
                            🗑️ Delete All Expenses ({expenseCount})
                        </button>
                    )}
                    {incomeCount > 0 && (
                        <button
                            onClick={() => handleBulkDeleteClick('income')}
                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-sm font-medium"
                            title={`Delete all ${incomeCount} income transactions`}
                        >
                            🗑️ Delete All Income ({incomeCount})
                        </button>
                    )}
                    {transactions.length > 0 && (
                        <button
                            onClick={() => handleBulkDeleteClick('all')}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                            title={`Delete all ${transactions.length} transactions`}
                        >
                            🗑️ Delete All ({transactions.length})
                        </button>
                    )}
                </div>
            </div>
            {/* Transactions List */}
            <div className="mt-8">
                {isLoading ? (
                    <div className="text-gray-500">Loading transactions...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : transactions.length === 0 ? (
                    <div className="text-gray-400">No transactions found.</div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <table className="w-full mt-4 divide-y divide-gray-200 table-fixed">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="w-[25%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="w-[20%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                        <th className="w-[10%] px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.map((t) => (
                                        <tr key={t._id} className="hover:bg-gray-50">
                                            <td className="px-3 py-4 text-sm text-gray-900 truncate">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className={`px-3 py-4 text-sm font-semibold truncate ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                ${t.amount.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-900 truncate" title={t.description}>{t.description}</td>
                                            <td className="px-3 py-4 text-sm text-gray-900 truncate">{typeof t.category === 'object' && t.category !== null ? t.category.name : t.category}</td>
                                            <td className="px-3 py-4 text-sm text-gray-900 truncate">{t.source?.name || t.source}</td>
                                            <td className="px-3 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => onEdit(t)}
                                                        className="inline-flex items-center px-1.5 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <span className="text-xs">✏️</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(t)}
                                                        className="inline-flex items-center px-1.5 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <span className="text-xs">🗑️</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden mt-4 space-y-4">
                            {transactions.map((t) => (
                                <motion.div
                                    key={t._id}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className={`text-lg font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                ${t.amount.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(t.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onEdit(t)}
                                                className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                                title="Edit"
                                            >
                                                <span className="text-sm">✏️</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(t)}
                                                className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                title="Delete"
                                            >
                                                <span className="text-sm">🗑️</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-900 font-medium mb-1">
                                        {t.description}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>
                                            <strong>Category:</strong> {typeof t.category === 'object' && t.category !== null ? t.category.name : t.category}
                                        </span>
                                        <span>
                                            <strong>Source:</strong> {t.source?.name || t.source}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Single Transaction Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Bulk Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showBulkDeleteDialog}
                onClose={() => setShowBulkDeleteDialog(false)}
                onConfirm={handleConfirmBulkDelete}
                title={`Delete All ${bulkDeleteType === 'all' ? 'Transactions' : bulkDeleteType === 'expense' ? 'Expenses' : 'Income'}`}
                message={
                    bulkDeleteType === 'all' 
                        ? `Are you sure you want to delete ALL ${transactions.length} transactions? This will remove all your financial data and cannot be undone.`
                        : bulkDeleteType === 'expense'
                        ? `Are you sure you want to delete ALL ${expenseCount} expense transactions? This action cannot be undone and will restore the amounts to your source balances.`
                        : `Are you sure you want to delete ALL ${incomeCount} income transactions? This action cannot be undone and will remove the amounts from your source balances.`
                }
                confirmText={`Delete All ${bulkDeleteType === 'all' ? 'Transactions' : bulkDeleteType === 'expense' ? 'Expenses' : 'Income'}`}
                cancelText="Cancel"
                type="danger"
            />
        </motion.div>
    );
};

export default TransactionTable; 