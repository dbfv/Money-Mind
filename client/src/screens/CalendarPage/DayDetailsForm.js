import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PopupForm from '../../components/PopupForm';
import EventForm from './EventForm';

const DayDetailsForm = ({
    onClose,
    date,
    transactions,
    events = [], // Add default empty array
    event,
    onChange,
    onSubmit,
    error,
    categories,
    sources
}) => {
    // Add state for active tab
    const [activeTab, setActiveTab] = useState('transactions');

    // Format the date for display
    const formatDisplayDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    // Calculate transaction totals
    const calculateTransactionTotals = () => {
        let totalExpenses = 0;
        let totalIncome = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                totalExpenses += transaction.amount;
            } else if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            }
        });

        const netAmount = totalIncome - totalExpenses;

        return {
            totalExpenses: totalExpenses.toFixed(2),
            totalIncome: totalIncome.toFixed(2),
            netAmount: netAmount.toFixed(2),
            isPositive: netAmount >= 0
        };
    };

    const totals = calculateTransactionTotals();

    // Transaction item component
    const TransactionItem = ({ transaction }) => {
        const getTransactionStyle = () => {
            const typeColor = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
            const borderColor = transaction.type === 'income' ? 'border-green-200' : 'border-red-200';
            const bgColor = transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50';
            return { typeColor, borderColor, bgColor };
        };

        const { typeColor, borderColor, bgColor } = getTransactionStyle();

        return (
            <motion.div
                className={`p-3 mb-2 rounded-lg ${bgColor} ${borderColor} border`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex justify-between items-center">
                    <div className="font-semibold">{transaction.description}</div>
                    <div className={`font-bold ${typeColor}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                </div>
                <div className="flex justify-between text-sm mt-1 text-gray-600">
                    <div>
                        {transaction.category?.name || 'Uncategorized'}
                    </div>
                    <div>
                        {transaction.source?.name || 'Unknown Source'}
                    </div>
                </div>
            </motion.div>
        );
    };

    // Event item component
    const EventItem = ({ event }) => {
        const getEventStyle = () => {
            let typeColor, borderColor, bgColor;

            switch (event.type) {
                case 'income':
                    typeColor = 'text-green-600';
                    borderColor = 'border-green-200';
                    bgColor = 'bg-green-50';
                    break;
                case 'expense':
                    typeColor = 'text-red-600';
                    borderColor = 'border-red-200';
                    bgColor = 'bg-red-50';
                    break;
                case 'reminder':
                    typeColor = 'text-blue-600';
                    borderColor = 'border-blue-200';
                    bgColor = 'bg-blue-50';
                    break;
                case 'prediction':
                    typeColor = 'text-purple-600';
                    borderColor = 'border-purple-200';
                    bgColor = 'bg-purple-50';
                    break;
                default:
                    typeColor = 'text-gray-600';
                    borderColor = 'border-gray-200';
                    bgColor = 'bg-gray-50';
            }

            return { typeColor, borderColor, bgColor };
        };

        const { typeColor, borderColor, bgColor } = getEventStyle();
        const isRecurringIcon = event.isRecurring ? '🔄 ' : '';

        return (
            <motion.div
                className={`p-3 mb-2 rounded-lg ${bgColor} ${borderColor} border`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex justify-between items-center">
                    <div className="font-semibold">{isRecurringIcon}{event.title}</div>
                    {event.amount > 0 && (
                        <div className={`font-bold ${typeColor}`}>
                            {event.type === 'income' ? '+' : '-'}${parseFloat(event.amount).toFixed(2)}
                        </div>
                    )}
                </div>
                {event.description && (
                    <div className="text-sm mt-1 text-gray-600">
                        {event.description}
                    </div>
                )}
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                    <div className="capitalize">
                        {event.frequency !== 'once' ? `${event.frequency}` : 'One-time'}
                    </div>
                    <div>
                        {event.category?.name && `Category: ${event.category.name}`}
                    </div>
                </div>
            </motion.div>
        );
    };

    // Transaction summary component
    const TransactionSummary = () => {
        return (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-red-100 rounded-lg p-3">
                        <div className="text-sm text-gray-500">Total Expenses</div>
                        <div className="text-lg font-bold text-red-600">-${totals.totalExpenses}</div>
                    </div>
                    <div className="bg-white border border-green-100 rounded-lg p-3">
                        <div className="text-sm text-gray-500">Total Income</div>
                        <div className="text-lg font-bold text-green-600">+${totals.totalIncome}</div>
                    </div>
                </div>
                <div className="mt-3 bg-white border border-gray-200 rounded-lg p-3">
                    <div className="text-sm text-gray-500">Net Balance for the Day</div>
                    <div className={`text-lg font-bold ${totals.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {totals.isPositive ? '+' : ''}${totals.netAmount}
                    </div>
                </div>
            </div>
        );
    };

    // Tab navigation
    const TabNavigation = () => (
        <div className="flex border-b border-gray-200">
            <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'transactions'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                Transactions
            </button>
            <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'events'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                Events
            </button>
        </div>
    );

    // Generate the transaction list content
    const generateTransactionList = () => {
        if (transactions.length === 0) {
            return (
                <div className="text-center p-6 text-gray-500">
                    <div className="mb-2">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p>No transactions for this day.</p>
                </div>
            );
        }

        return (
            <div className="overflow-y-auto max-h-[400px] p-4">
                <h3 className="font-medium text-gray-700 mb-3">Transactions for {formatDisplayDate(date)}</h3>
                <AnimatePresence>
                    {transactions.map(transaction => (
                        <TransactionItem key={transaction._id} transaction={transaction} />
                    ))}
                </AnimatePresence>
            </div>
        );
    };

    // Generate the events list content
    const generateEventsList = () => {
        if (events.length === 0) {
            return (
                <div className="text-center p-6 text-gray-500">
                    <div className="mb-2">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p>No events for this day.</p>
                    <p className="mt-2 text-sm">Create a new event using the form.</p>
                </div>
            );
        }

        return (
            <div className="overflow-y-auto max-h-[400px] p-4">
                <h3 className="font-medium text-gray-700 mb-3">Events for {formatDisplayDate(date)}</h3>
                <AnimatePresence>
                    {events.map(event => (
                        <EventItem key={event._id} event={event} />
                    ))}
                </AnimatePresence>
            </div>
        );
    };

    const contentSection = (
        <div className="flex flex-col md:flex-row h-full gap-6">
            {/* Left side: Transactions/Events Tabs */}
            <div className="md:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-800">
                        Activity for {formatDisplayDate(date)}
                    </h2>
                </div>

                <TabNavigation />

                {/* Transaction Summary - only show when on transactions tab */}
                {activeTab === 'transactions' && transactions.length > 0 && <TransactionSummary />}

                {/* Conditional content based on active tab */}
                {activeTab === 'transactions' ? generateTransactionList() : generateEventsList()}
            </div>

            {/* Right side: Event form */}
            <div className="md:w-1/2">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Add New Event</h2>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                <form onSubmit={e => {
                    e.preventDefault();
                    onSubmit(event);
                }}>
                    {/* Title input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title*
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={event.title || ''}
                            onChange={onChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            placeholder="e.g. Rent Payment, Salary, etc."
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={event.description || ''}
                            onChange={onChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            placeholder="Enter additional details..."
                            rows="2"
                        />
                    </div>

                    {/* Type and amount */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type*
                            </label>
                            <select
                                name="type"
                                value={event.type || 'expense'}
                                onChange={onChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            >
                                <option value="expense">Expense 💸</option>
                                <option value="income">Income 💰</option>
                                <option value="reminder">Reminder 🔔</option>
                                <option value="prediction">Prediction 🔮</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={event.amount || ''}
                                onChange={onChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Recurring checkbox */}
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="isRecurring"
                            name="isRecurring"
                            checked={event.isRecurring || false}
                            onChange={onChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                            Recurring Event
                        </label>
                    </div>

                    {/* Frequency if recurring */}
                    {event.isRecurring && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Frequency*
                            </label>
                            <select
                                name="frequency"
                                value={event.frequency || 'monthly'}
                                onChange={onChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            >
                                <option value="daily">Daily 📅</option>
                                <option value="weekly">Weekly 🗓️</option>
                                <option value="biweekly">Bi-weekly 📆</option>
                                <option value="monthly">Monthly 📅</option>
                                <option value="quarterly">Quarterly 🗓️</option>
                                <option value="annually">Annually 📊</option>
                            </select>
                        </div>
                    )}

                    {/* Submit button */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                        >
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {formatDisplayDate(date)}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-6">
                        {contentSection}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DayDetailsForm; 