const User = require('../users/user.model');
const Transaction = require('../transactions/transaction.model');
const aiService = require('../../services/aiService');

const aiController = {
    // Get investment suggestion for the authenticated user
    getInvestmentSuggestion: async (req, res) => {
        try {
            const userId = req.user.id;

            // Fetch the user's complete profile
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Calculate average monthly income from last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const incomeTransactions = await Transaction.find({
                userId: userId,
                type: 'income',
                date: { $gte: sixMonthsAgo }
            });

            // Calculate average monthly income
            let averageMonthlyIncome = 0;
            if (incomeTransactions.length > 0) {
                const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
                const monthsWithData = Math.max(1, Math.ceil(incomeTransactions.length / 4)); // Rough estimate
                averageMonthlyIncome = totalIncome / monthsWithData;
            }

            // If no income data, use a default or return error
            if (averageMonthlyIncome === 0) {
                return res.status(400).json({ 
                    message: 'No income data found. Please add some income transactions first to get investment suggestions.' 
                });
            }

            // Generate investment suggestion using AI service
            const investmentSuggestion = await aiService.generateInvestmentSuggestion(user, averageMonthlyIncome);

            res.json({
                success: true,
                data: investmentSuggestion
            });

        } catch (error) {
            console.error('Error generating investment suggestion:', error);
            res.status(500).json({ 
                message: 'Error generating investment suggestion',
                error: error.message 
            });
        }
    }
};

module.exports = aiController;