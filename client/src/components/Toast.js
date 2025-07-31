import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Update the toastVariants animation based on position
const getToastVariants = (position) => {
    // Determine if the toast should animate from top or bottom
    const initial = position.includes('top') ? { y: -20 } : { y: 20 };
    const exit = position.includes('top') ? { y: -20 } : { y: 20 };

    return {
        hidden: {
            opacity: 0,
            ...initial,
            scale: 0.8,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 25
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            ...exit,
            transition: {
                duration: 0.2
            }
        }
    };
};

/**
 * Toast notification component that automatically dismisses
 * 
 * @param {Object} props Component props
 * @param {boolean} props.show Whether to show the toast
 * @param {function} props.onClose Callback when toast closes
 * @param {string} props.message Message to display
 * @param {string} props.type Type of toast (success, error, info, warning)
 * @param {number} props.duration Duration in ms before auto-dismiss
 * @param {string} props.position Position of toast (top, bottom)
 */
const Toast = ({
    show,
    onClose,
    message,
    type = 'success',
    duration = 3000,
    position = 'bottom-center' // Change default to bottom-center
}) => {
    useEffect(() => {
        if (show && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [show, duration, onClose]);

    // Get the appropriate styling based on toast type
    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bgColor: 'bg-green-500',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )
                };
            case 'error':
                return {
                    bgColor: 'bg-red-500',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )
                };
            case 'warning':
                return {
                    bgColor: 'bg-amber-500',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )
                };
            case 'info':
            default:
                return {
                    bgColor: 'bg-blue-500',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
        }
    };

    const { bgColor, icon } = getToastStyles();

    // Enhanced position logic
    let positionClass = '';
    switch (position) {
        case 'top-left':
            positionClass = 'top-4 left-4';
            break;
        case 'top-center':
            positionClass = 'top-4 left-1/2 transform -translate-x-1/2';
            break;
        case 'top-right':
            positionClass = 'top-4 right-4';
            break;
        case 'bottom-left':
            positionClass = 'bottom-4 left-4';
            break;
        case 'bottom-right':
            positionClass = 'bottom-4 right-4';
            break;
        case 'bottom-center':
        default:
            positionClass = 'bottom-4 left-1/2 transform -translate-x-1/2';
            break;
    }

    // Use our dynamic variants based on position
    const variants = getToastVariants(position);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className={`fixed ${positionClass} z-50 flex justify-between items-center px-4 py-3 rounded-lg shadow-lg ${bgColor} text-white min-w-[300px] max-w-md`}
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0">
                            {icon}
                        </div>
                        <div>
                            <p className="font-medium">{message}</p>
                        </div>
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="ml-4 focus:outline-none hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                            aria-label="Close"
                        >
                            <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast; 