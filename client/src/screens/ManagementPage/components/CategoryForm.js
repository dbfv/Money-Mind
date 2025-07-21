import React from 'react';
import { motion } from 'framer-motion';
import CategoryFields from '../../../components/Forms/CategoryFields';

const CategoryForm = ({
    values,
    onChange,
    onSubmit,
    onClose,
    isEditing
}) => {
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit' : 'Add'} Category
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                >
                    ✕
                </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <CategoryFields
                    values={values}
                    onChange={onChange}
                />
                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    {isEditing ? 'Update' : 'Add'} Category
                </button>
            </form>
        </>
    );
};

export default CategoryForm; 