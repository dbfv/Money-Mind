const ChatHistory = require('./chatHistory.model');

const chatHistoryController = {
    // Get chat history for a user
    getChatHistory: async (req, res) => {
        try {
            const { limit = 50 } = req.query;
            const userId = req.user.id;

            let chatHistory = await ChatHistory.findOne({ userId })
                .select('messages')
                .lean();

            if (!chatHistory) {
                return res.json({ messages: [] });
            }

            // Get the most recent messages (limited)
            const recentMessages = chatHistory.messages
                .slice(-parseInt(limit))
                .map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp
                }));

            res.json({ messages: recentMessages });
        } catch (error) {
            console.error('Error getting chat history:', error);
            res.status(500).json({ message: 'Error retrieving chat history', error: error.message });
        }
    },

    // Clear chat history for a user
    clearChatHistory: async (req, res) => {
        try {
            const userId = req.user.id;

            await ChatHistory.findOneAndUpdate(
                { userId },
                { messages: [] },
                { upsert: true }
            );

            res.json({ message: 'Chat history cleared successfully' });
        } catch (error) {
            console.error('Error clearing chat history:', error);
            res.status(500).json({ message: 'Error clearing chat history', error: error.message });
        }
    },

    // Add a message to chat history
    addMessage: async (userId, role, content) => {
        try {
            const message = {
                role,
                content,
                timestamp: new Date()
            };

            await ChatHistory.findOneAndUpdate(
                { userId },
                { 
                    $push: { 
                        messages: {
                            $each: [message],
                            $slice: -100 // Keep only the last 100 messages
                        }
                    }
                },
                { upsert: true }
            );

            return message;
        } catch (error) {
            console.error('Error adding message to chat history:', error);
            throw error;
        }
    },

    // Get recent conversation context for AI
    getConversationContext: async (userId, messageLimit = 10) => {
        try {
            const chatHistory = await ChatHistory.findOne({ userId })
                .select('messages')
                .lean();

            if (!chatHistory || !chatHistory.messages.length) {
                return [];
            }

            // Get the most recent messages for context
            return chatHistory.messages
                .slice(-messageLimit)
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));
        } catch (error) {
            console.error('Error getting conversation context:', error);
            return [];
        }
    }
};

module.exports = chatHistoryController;