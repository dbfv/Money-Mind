import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AIChat from './AIChat';

const ChatIcon = ({ userId, onTransactionAdded }) => {
    const [isAIOpen, setIsAIOpen] = useState(false);

    return (
        <>
            {/* AI Chat Button */}
            <motion.button
                onClick={() => setIsAIOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center z-40"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <span className="text-xl">🤖</span>
            </motion.button>

            {/* AI Chat Modal */}
            <AIChat 
                isOpen={isAIOpen} 
                onClose={() => setIsAIOpen(false)} 
                userId={userId}
                onTransactionAdded={onTransactionAdded}
            />
        </>
    );
};

export default ChatIcon;