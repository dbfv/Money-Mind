import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from '../../../components/Dropdown';

const formVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3 }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.2 }
    }
};

const TransactionForm = ({
    showForm,
    onClose,
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    categories,
    sources,
    getSourceBalanceInfo
}) => {
    return (
        <AnimatePresence>
            {showForm && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Add Transaction</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                    {errors.amount && (
                                        <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <Dropdown
                                    label="Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    options={categories.map(c => ({
                                        value: c._id,
                                        label: `${c.name} (${c.type === 'expense' ? '💸' : '💰'})`
                                    }))}
                                    error={errors.category}
                                    placeholder="Select a category"
                                    required
                                />

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter description"
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                    )}
                                </div>

                                {/* Source */}
                                <div className="space-y-1">
                                    <Dropdown
                                        label="Source"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleInputChange}
                                        options={sources.map(s => ({ value: s._id, label: s.name }))}
                                        error={errors.source}
                                        placeholder="Select a source"
                                        required
                                    />
                                    {getSourceBalanceInfo && getSourceBalanceInfo()}
                                </div>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                        {errors.submit}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex space-x-3 pt-4">
                                    <motion.button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 ${isSubmitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                            }`}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating...
                                            </div>
                                        ) : (
                                            'Create Transaction'
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TransactionForm; 