import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ConfirmationDialog from '../../../components/ConfirmationDialog';

const TransactionTable = ({ transactions, isLoading, error, onEdit, onDelete }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const handleDeleteClick = (transaction) => {
        setTransactionToDelete(transaction);
        setShowConfirmDialog(true);
    };

    const handleConfirmDelete = () => {
        if (transactionToDelete) {
            onDelete(transactionToDelete);
        }
    };

    return (
        <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">Transaction Journal</div>
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
                )}
            </div>

            {/* Confirmation Dialog */}
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
        </motion.div>
    );
};

export default TransactionTable; 