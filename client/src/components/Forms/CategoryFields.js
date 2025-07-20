import React from 'react';

const CategoryFields = () => (
    <>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
            </label>
            <input
                type="text"
                name="categoryName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter category name"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Type *
            </label>
            <select
                name="categoryType"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
                <option value="">Select type</option>
                <option value="expense">Expense 💸</option>
                <option value="income">Income 💰</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
            </label>
            <textarea
                name="description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter description (optional)"
            ></textarea>
        </div>
    </>
);

export default CategoryFields;
