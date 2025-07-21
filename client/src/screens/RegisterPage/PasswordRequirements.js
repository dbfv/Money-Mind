import React from 'react';
import { motion } from 'framer-motion';

const PasswordRequirements = ({ requirements }) => {
    return (
        <motion.div
            className="mt-1 p-1 bg-gray-50 rounded text-xs"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                <div className="flex items-center">
                    <span className={`mr-1 ${requirements.minLength ? 'text-green-500' : 'text-red-500'}`}>
                        {requirements.minLength ? '✓' : '✗'}
                    </span>
                    <span className={requirements.minLength ? 'text-green-700' : 'text-red-700'}>
                        8+ characters
                    </span>
                </div>
                <div className="flex items-center">
                    <span className={`mr-1 ${requirements.hasUppercase ? 'text-green-500' : 'text-red-500'}`}>
                        {requirements.hasUppercase ? '✓' : '✗'}
                    </span>
                    <span className={requirements.hasUppercase ? 'text-green-700' : 'text-red-700'}>
                        Uppercase letter
                    </span>
                </div>
                <div className="flex items-center">
                    <span className={`mr-1 ${requirements.hasLowercase ? 'text-green-500' : 'text-red-500'}`}>
                        {requirements.hasLowercase ? '✓' : '✗'}
                    </span>
                    <span className={requirements.hasLowercase ? 'text-green-700' : 'text-red-700'}>
                        Lowercase letter
                    </span>
                </div>
                <div className="flex items-center">
                    <span className={`mr-1 ${requirements.hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                        {requirements.hasNumber ? '✓' : '✗'}
                    </span>
                    <span className={requirements.hasNumber ? 'text-green-700' : 'text-red-700'}>
                        Number
                    </span>
                </div>
                <div className="flex items-center col-span-2">
                    <span className={`mr-1 ${requirements.hasSpecialChar ? 'text-green-500' : 'text-red-500'}`}>
                        {requirements.hasSpecialChar ? '✓' : '✗'}
                    </span>
                    <span className={requirements.hasSpecialChar ? 'text-green-700' : 'text-red-700'}>
                        Special character
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default PasswordRequirements; 