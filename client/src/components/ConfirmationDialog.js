import React from 'react';
import { motion } from 'framer-motion';

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const dialogVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 500
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 20,
        transition: {
            duration: 0.2
        }
    }
};

const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning" // 'warning', 'danger', 'info'
}) => {
    if (!isOpen) return null;

    const getColorScheme = () => {
        switch (type) {
            case 'danger':
                return {
                    button: 'bg-red-600 hover:bg-red-700',
                    icon: 'text-red-600'
                };
            case 'info':
                return {
                    button: 'bg-blue-600 hover:bg-blue-700',
                    icon: 'text-blue-600'
                };
            case 'warning':
            default:
                return {
                    button: 'bg-amber-600 hover:bg-amber-700',
                    icon: 'text-amber-600'
                };
        }
    };

    const colorScheme = getColorScheme();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                variants={dialogVariants}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
            >
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        {type === 'danger' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mr-3 ${colorScheme.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                        {type === 'warning' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mr-3 ${colorScheme.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {type === 'info' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mr-3 ${colorScheme.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <h3 className="text-lg font-medium text-gray-900" id="dialog-title">
                            {title}
                        </h3>
                    </div>

                    <p className="text-gray-700 mb-6">
                        {message}
                    </p>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 border border-transparent rounded-lg text-white ${colorScheme.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConfirmationDialog; 