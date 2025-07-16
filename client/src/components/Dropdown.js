import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dropdown = ({
    label,
    name,
    value,
    onChange,
    options,
    error,
    placeholder = 'Select an option',
    className = '',
    required = false,
}) => {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const listRef = useRef(null);

    // Find the selected option label
    const selected = options.find(
        opt => (opt.value ?? opt._id ?? opt) === value
    );

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(e.target) &&
                listRef.current &&
                !listRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open]);

    const handleSelect = (option) => {
        const event = {
            target: {
                name,
                value: option.value ?? option._id ?? option,
            },
        };
        onChange(event);
        setOpen(false);
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && '*'}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    ref={buttonRef}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white cursor-pointer hover:border-gray-400 focus:shadow-lg flex justify-between items-center ${error ? 'border-red-500' : 'border-gray-300'}`}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                >
                    <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
                        {selected ? selected.label ?? selected.name ?? selected : placeholder}
                    </span>
                    <svg className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <AnimatePresence>
                    {open && (
                        <motion.ul
                            ref={listRef}
                            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            tabIndex={-1}
                            role="listbox"
                        >
                            {options.map((opt, idx) => {
                                const optValue = opt.value ?? opt._id ?? opt;
                                const optLabel = opt.label ?? opt.name ?? opt;
                                return (
                                    <li
                                        key={optValue}
                                        role="option"
                                        aria-selected={value === optValue}
                                        className={`px-4 py-2 cursor-pointer select-none transition-colors duration-100 ${value === optValue ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                        onClick={() => handleSelect(opt)}
                                    >
                                        {optLabel}
                                    </li>
                                );
                            })}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};

export default Dropdown; 