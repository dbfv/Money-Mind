const chatHistoryController = require('./chatHistory.controller');
const auth = require('../../middleware/auth');

const chatHistoryRoutes = (app) => {
    // Get chat history for the authenticated user
    app.route('/api/chat-history')
        .get(auth, chatHistoryController.getChatHistory)
        .delete(auth, chatHistoryController.clearChatHistory);
};

module.exports = chatHistoryRoutes;