const aiController = require('./ai.controller');
const auth = require('../../middleware/auth');

const aiRoutes = (app) => {
    // Investment suggestion endpoint
    app.route('/api/ai/investment-suggestion')
        .post(auth, aiController.getInvestmentSuggestion);
};

module.exports = aiRoutes;