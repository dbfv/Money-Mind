import React from 'react';

const CategoryTable = ({ categories, onEdit, onDelete, onAdd, showForm }) => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                {!showForm && (
                    <button
                        onClick={onAdd}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Add Category
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map(category => (
                            <tr key={category._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {category.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.type === 'expense' ? '💸 Expense' : '💰 Income'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => onEdit(category)}
                                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                    >
                                        <span className="text-xs mr-1">✏️</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(category._id)}
                                        className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                    >
                                        <span className="text-xs mr-1">🗑️</span>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryTable; 