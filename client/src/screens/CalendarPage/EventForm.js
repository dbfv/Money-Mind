import React from 'react';
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
    error
}) => {
    // Type and frequency options
    const typeOptions = [
        { value: 'income', label: 'Income' },
        { value: 'expense', label: 'Expense' }
    ];

    const frequencyOptions = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Bi-weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'annually', label: 'Annually' }
    ];

    const formContent = (
        <>
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    name="title"
                    value={event.title}
                    onChange={onChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                    placeholder="e.g. Rent Payment, Salary, etc."
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Dropdown
                        label="Type"
                        name="type"
                        value={event.type}
                        onChange={onChange}
                        options={typeOptions}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                    </label>
                    <input
                        type="number"
                        name="amount"
                        value={event.amount}
                        onChange={onChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                        placeholder="0.00"
                        step="0.01"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                </label>
                <input
                    type="date"
                    name="date"
                    value={event.date}
                    onChange={onChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                    required
                />
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="recurring"
                    name="recurring"
                    checked={event.recurring}
                    onChange={onChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                    Recurring Event
                </label>
            </div>

            {event.recurring && (
                <div>
                    <Dropdown
                        label="Frequency"
                        name="frequency"
                        value={event.frequency}
                        onChange={onChange}
                        options={frequencyOptions}
                    />
                </div>
            )}

            {!isNew && (
                <div className="flex justify-start">
                    <motion.button
                        type="button"
                        onClick={onDelete}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                        Delete
                    </motion.button>
                </div>
            )}
        </>
    );

    return (
        <PopupForm
            isOpen={true}
            onClose={onClose}
            onSubmit={onSubmit}
            title={isNew ? 'Add New Event' : 'Edit Event'}
            submitText={isNew ? 'Create' : 'Update'}
        >
            {formContent}
        </PopupForm>
    );
};

export default EventForm; 