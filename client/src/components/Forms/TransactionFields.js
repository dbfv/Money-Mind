import React from 'react';
import { motion } from 'framer-motion';

const TransactionFields = ({ formData, handleInputChange, errors, categories, sources }) => (
    <>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
            </label>
            <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                placeholder="0.00"
                step="0.01"
                min="0"
            />
            {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
            </label>
            <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                required
            >
                <option value="">Select category</option>
                {categories.map(c => (
                    <option key={c._id} value={c._id}>
                        {c.name} ({c.type === 'expense' ? '💸' : '💰'})
                    </option>
                ))}
            </select>
            {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
        </div>

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

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
            </label>
            <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                placeholder="Enter description"
            />
            {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Source *
            </label>
            <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.source ? 'border-red-500' : 'border-gray-300'
                    }`}
                required
            >
                <option value="">Select source</option>
                {sources.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                ))}
            </select>
            {errors.source && (
                <p className="text-red-500 text-sm mt-1">{errors.source}</p>
            )}
        </div>

        {errors.submit && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errors.submit}
            </div>
        )}
    </>
);

export default TransactionFields;
