import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

const AIChat = ({ isOpen, onClose, userId }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && userId) {
            // Initialize socket connection
            socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
            
            socketRef.current.on('connect', () => {
                setIsConnected(true);
                console.log('Connected to AI chat');
            });

            socketRef.current.on('disconnect', () => {
                setIsConnected(false);
                console.log('Disconnected from AI chat');
            });

            socketRef.current.on('chat_response', (response) => {
                setIsTyping(false);
                
                const newMessage = {
                    id: Date.now(),
                    type: 'ai',
                    content: response.message,
                    timestamp: new Date(),
                    responseType: response.type,
                    transaction: response.transaction,
                    results: response.results
                };

                setMessages(prev => [...prev, newMessage]);
            });

            // Add welcome message
            setMessages([{
                id: Date.now(),
                type: 'ai',
                content: "Hi! I'm your financial assistant. I can help you add transactions, answer questions about your finances, or provide financial advice. What would you like to do?",
                timestamp: new Date(),
                responseType: 'text'
            }]);

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [isOpen, userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = () => {
        if (!inputMessage.trim() || !isConnected) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Send to AI
        socketRef.current.emit('chat_message', {
            userId: userId,
            message: inputMessage
        });

        setInputMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMessage = (message) => {
        // Simple formatting for better readability
        return message.split('\n').map((line, index) => (
            <span key={index}>
                {line}
                {index < message.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg">🤖</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">AI Financial Assistant</h3>
                                <p className="text-xs text-gray-500">
                                    {isConnected ? 'Online' : 'Connecting...'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                        message.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <div className="text-sm">
                                        {formatMessage(message.content)}
                                    </div>
                                    
                                    {/* Display function execution results */}
                                    {message.results && message.results.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {message.results.map((result, index) => (
                                                <div key={index} className={`p-2 rounded text-xs ${
                                                    result.type === 'error' 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {result.type === 'transaction' && (
                                                        <>✅ Transaction: ${result.data.amount} - {result.data.description || result.data.category?.name}</>
                                                    )}
                                                    {result.type === 'category' && (
                                                        <>📁 Category created: {result.data.name} ({result.data.type})</>
                                                    )}
                                                    {result.type === 'source' && (
                                                        <>🏦 Source created: {result.data.name}</>
                                                    )}
                                                    {result.type === 'event' && (
                                                        <>📅 Event added: {result.data.title}</>
                                                    )}
                                                    {result.type === 'error' && (
                                                        <>❌ Error: {result.message}</>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Legacy transaction display (for backward compatibility) */}
                                    {message.transaction && !message.results && (
                                        <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-800">
                                            ✅ Transaction added: ${message.transaction.amount} - {message.transaction.description}
                                        </div>
                                    )}
                                    <div className="text-xs opacity-70 mt-1">
                                        {message.timestamp.toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about your finances..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!isConnected}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || !isConnected}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Send
                            </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Try: "Add $50 for gas" or "Create a coffee category" or "Remind me to pay rent on the 1st"
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AIChat;