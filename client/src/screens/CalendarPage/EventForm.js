import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Dropdown from '../../components/Dropdown';
import PopupForm from '../../components/PopupForm';

const EventForm = ({
    onClose,
    onSubmit,
    onDelete,
    event,
    onChange,
    isNew,
    error,
    categories,
    sources
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Type options
    const typeOptions = [
        { value: 'expense', label: 'Expense 💸' },
        { value: 'income', label: 'Income 💰' },
        { value: 'reminder', label: 'Reminder 🔔' },
        { value: 'prediction', label: 'Prediction 🔮' },
    ];

    // Frequency options
    const frequencyOptions = [
        { value: 'daily', label: 'Daily 📅' },
        { value: 'weekly', label: 'Weekly 🗓️' },
        { value: 'biweekly', label: 'Bi-weekly 📆' },
        { value: 'monthly', label: 'Monthly 📅' },
        { value: 'quarterly', label: 'Quarterly 🗓️' },
        { value: 'annually', label: 'Annually 📊' },
    ];

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare the data with the right format
        const formData = {
            ...event,
            startDate: event.startDate || event.date, // Handle both formats
            amount: parseFloat(event.amount || 0)
        };

        onSubmit(formData);
    };

    // Determine if we should show amount field
    const showAmountField = event.type === 'expense' || event.type === 'income' || event.type === 'prediction';

    // Determine if we should show category/source fields
    const showFinancialFields = event.type === 'expense' || event.type === 'income';

    const formContent = (
        <>
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title*
                </label>
                <input
                    type="text"
                    name="title"
                    value={event.title || ''}
                    onChange={onChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                    placeholder="e.g. Rent Payment, Salary, etc."
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    name="description"
                    value={event.description || ''}
                    onChange={onChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                    placeholder="Enter additional details..."
                    rows="2"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Dropdown
                        label="Type*"
                        name="type"
                        value={event.type || 'expense'}
                        onChange={onChange}
                        options={typeOptions}
                        required
                    />
                </div>

                {showAmountField && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={event.amount || ''}
                            onChange={onChange}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date*
                </label>
                <input
                    type="date"
                    name="startDate"
                    value={event.startDate || event.date || ''}
                    onChange={onChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                    required
                />
            </div>

            {/* Financial fields (category/source) */}
            {showFinancialFields && (
                <div className="grid grid-cols-2 gap-4">
                    {categories && categories.length > 0 && (
                        <Dropdown
                            label="Category"
                            name="category"
                            value={event.category || ''}
                            onChange={onChange}
                            options={categories
                                .filter(c => c.type === event.type)
                                .map(c => ({ value: c._id, label: c.name }))
                            }
                            placeholder="Select category"
                        />
                    )}

                    {sources && sources.length > 0 && (
                        <Dropdown
                            label="Source"
                            name="source"
                            value={event.source || ''}
                            onChange={onChange}
                            options={sources.map(s => ({ value: s._id, label: s.name }))}
                            placeholder="Select source"
                        />
                    )}
                </div>
            )}

            <div className="flex items-center">
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

            {event.isRecurring && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Dropdown
                                label="Frequency*"
                                name="frequency"
                                value={event.frequency || 'monthly'}
                                onChange={onChange}
                                options={frequencyOptions}
                                required={event.isRecurring}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Times
                            </label>
                            <input
                                type="number"
                                name="recurrenceCount"
                                value={event.recurrenceCount || ''}
                                onChange={onChange}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                                placeholder="Leave empty for infinite"
                                min="1"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={event.endDate || ''}
                            onChange={onChange}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            min={event.startDate || event.date || ''}
                        />
                    </div>
                </div>
            )}

            {/* Advanced options toggle */}
            <button
                type="button"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                onClick={() => setShowAdvanced(!showAdvanced)}
            >
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                <svg
                    className={`ml-1 w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {/* Advanced options */}
            {showAdvanced && (
                <div className="mt-2">
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="isCompleted"
                            name="isCompleted"
                            checked={event.isCompleted || false}
                            onChange={onChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-700">
                            Mark as Completed
                        </label>
                    </div>
                </div>
            )}

            {!isNew && (
                <div className="flex justify-start mt-4">
                    <motion.button
                        type="button"
                        onClick={onDelete}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete Event
                    </motion.button>
                </div>
            )}
        </>
    );

    return (
        <PopupForm
            isOpen={true}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={isNew ? 'Add New Event' : 'Edit Event'}
            submitText={isNew ? 'Create Event' : 'Update Event'}
        >
            {formContent}
        </PopupForm>
    );
};

export default EventForm; 