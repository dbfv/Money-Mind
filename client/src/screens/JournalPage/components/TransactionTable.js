import React from 'react';
import { motion } from 'framer-motion';

const TransactionTable = ({ transactions, isLoading, error }) => {
    return (
        <motion.div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">Transaction Journal</div>
            </div>
            {/* Transactions List */}
            <div className="mt-8 overflow-x-auto">
                {isLoading ? (
                    <div className="text-gray-500">Loading transactions...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
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
                                    <td className={`py-2 px-2 font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                    </td>
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
    );
};

export default TransactionTable; 