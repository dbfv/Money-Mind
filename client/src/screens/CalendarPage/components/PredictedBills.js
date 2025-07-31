import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PredictedBills = ({ events, onAcceptPrediction, onDismissPrediction }) => {
    const [predictedEvents, setPredictedEvents] = useState([]);

    useEffect(() => {
        // Filter events to show only AI predictions
        const predictions = events.filter(event => 
            event.type === 'prediction' && 
            event.metadata?.aiGenerated &&
            new Date(event.startDate) >= new Date()
        );
        setPredictedEvents(predictions);
    }, [events]);

    const handleAccept = async (eventId) => {
        try {
            await onAcceptPrediction(eventId);
            setPredictedEvents(prev => prev.filter(event => event._id !== eventId));
        } catch (error) {
            console.error('Error accepting prediction:', error);
        }
    };

    const handleDismiss = async (eventId) => {
        try {
            await onDismissPrediction(eventId);
            setPredictedEvents(prev => prev.filter(event => event._id !== eventId));
        } catch (error) {
            console.error('Error dismissing prediction:', error);
        }
    };

    if (predictedEvents.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 mb-6"
        >
            <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🤖</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                    AI Predicted Bills
                </h3>
                <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {predictedEvents.length} prediction{predictedEvents.length !== 1 ? 's' : ''}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Based on your transaction history, I've identified these potential recurring bills:
            </p>

            <div className="space-y-3">
                {predictedEvents.map((event) => (
                    <motion.div
                        key={event._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                                    <span className="text-lg font-semibold text-green-600">
                                        ${event.amount?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Due: {new Date(event.startDate).toLocaleDateString()}
                                </div>
                                {event.metadata?.pattern && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Pattern: {event.metadata.pattern}
                                    </div>
                                )}
                                {event.metadata?.confidence && (
                                    <div className="flex items-center mt-2">
                                        <span className="text-xs text-gray-500 mr-2">Confidence:</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                                            <div
                                                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                                                style={{ width: `${event.metadata.confidence * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600 ml-2">
                                            {(event.metadata.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                                <button
                                    onClick={() => handleAccept(event._id)}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleDismiss(event._id)}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 text-xs text-gray-500 italic">
                💡 These predictions are based on your transaction patterns. Accept to add them to your calendar or dismiss if they're not relevant.
            </div>
        </motion.div>
    );
};

export default PredictedBills;