import React, { createContext, useContext, useState } from 'react';
import Toast from './Toast';

// Create the context
const ToastContext = createContext({
    showToast: () => { },
    hideToast: () => { },
});

/**
 * Hook to use the toast functionality
 */
export const useToast = () => useContext(ToastContext);

/**
 * Provider component that wraps the application and provides toast functionality
 */
export const ToastProvider = ({ children }) => {
    // Update the toast state to use bottom-left position by default
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success',
        duration: 3000,
        position: 'bottom-left' // Changed from bottom-center to bottom-left
    });

    /**
     * Show a toast notification
     * 
     * @param {string} message - Message to display
     * @param {Object} options - Toast options
     * @param {string} options.type - Type of toast (success, error, info, warning)
     * @param {number} options.duration - Duration in ms before auto-dismiss
     * @param {string} options.position - Position of toast (top, bottom)
     */
    const showToast = (message, options = {}) => {
        setToast({
            show: true,
            message,
            type: options.type || 'success',
            duration: options.duration || 3000,
            position: options.position || 'bottom-left'
        });
    };

    /**
     * Hide the current toast
     */
    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            show: false
        }));
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                position={toast.position}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
};

export default ToastProvider; 