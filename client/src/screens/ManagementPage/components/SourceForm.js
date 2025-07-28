import React from 'react';
import { motion } from 'framer-motion';
import SourceFields from '../../../components/Forms/SourceFields';

const SourceForm = ({
    values,
    onChange,
    onSubmit,
    onClose,
    isEditing,
    isSubmitting = false,
    errors = {}
}) => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSubmitting) {
            await onSubmit(e);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit' : 'Add'} Source
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                    disabled={isSubmitting}
                >
                    ✕
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.submit && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {errors.submit}
                    </div>
                )}
                <SourceFields
                    values={values}
                    onChange={onChange}
                    disabled={isSubmitting}
                    errors={errors}
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 rounded-lg text-white transition-all duration-200 ${isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            {isEditing ? 'Updating...' : 'Adding...'}
                        </div>
                    ) : (
                        `${isEditing ? 'Update' : 'Add'} Source`
                    )}
                </button>
            </form>
        </>
    );
};

export default SourceForm; 