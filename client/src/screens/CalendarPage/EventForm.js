import React from 'react';
import { motion } from 'framer-motion';
import Dropdown from '../../components/Dropdown';

const EventForm = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    selectedEvent,
    newEvent,
    onEventChange,
    onSelectedEventChange,
    typeOptions,
    frequencyOptions,
}) => {
    const modalVariants = {
        hidden: {
            y: -50,
            opacity: 0
        },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        },
        exit: {
            y: 50,
            opacity: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {selectedEvent ? 'Edit Event' : 'Add New Event'}
                </h3>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={selectedEvent ? selectedEvent.title : newEvent.title}
                            onChange={selectedEvent ? onSelectedEventChange : onEventChange}
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
                                value={selectedEvent ? selectedEvent.type : newEvent.type}
                                onChange={selectedEvent ? onSelectedEventChange : onEventChange}
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
                                value={selectedEvent ? selectedEvent.amount : newEvent.amount}
                                onChange={selectedEvent ? onSelectedEventChange : onEventChange}
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
                            value={selectedEvent ? selectedEvent.date : newEvent.date}
                            onChange={selectedEvent ? onSelectedEventChange : onEventChange}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 border-gray-300"
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="recurring"
                            name="recurring"
                            checked={selectedEvent ? selectedEvent.recurring : newEvent.recurring}
                            onChange={selectedEvent ? onSelectedEventChange : onEventChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                            Recurring Event
                        </label>
                    </div>

                    {(selectedEvent?.recurring || newEvent.recurring) && (
                        <div>
                            <Dropdown
                                label="Frequency"
                                name="frequency"
                                value={selectedEvent ? selectedEvent.frequency : newEvent.frequency}
                                onChange={selectedEvent ? onSelectedEventChange : onEventChange}
                                options={frequencyOptions}
                            />
                        </div>
                    )}

                    <div className="flex justify-between pt-4">
                        <div>
                            {selectedEvent && (
                                <motion.button
                                    type="button"
                                    onClick={onDelete}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
                                >
                                    Delete
                                </motion.button>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <motion.button
                                type="button"
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                            >
                                Save
                            </motion.button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EventForm; 