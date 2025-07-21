import React from 'react';
import Dropdown from '../Dropdown';

const CategoryFields = ({ values = {}, onChange }) => {
    const categoryTypeOptions = [
        { value: 'expense', label: 'Expense 💸' },
        { value: 'income', label: 'Income 💰' }
    ];

    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                </label>
                <input
                    type="text"
                    name="categoryName"
                    value={values.categoryName || ''}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter category name"
                />
            </div>

            <Dropdown
                label="Category Type"
                name="categoryType"
                value={values.categoryType || ''}
                onChange={onChange}
                options={categoryTypeOptions}
                placeholder="Select type"
                required
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    name="description"
                    value={values.description || ''}
                    onChange={onChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter description (optional)"
                ></textarea>
            </div>
        </>
    );
};

export default CategoryFields;
