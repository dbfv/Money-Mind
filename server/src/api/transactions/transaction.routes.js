const transactionController = require('./transaction.controller');
const auth = require('../../middleware/auth'); // Import the auth middleware

const transactionRoutes = (app) => {
    app.route('/api/transactions')
        .post(auth, transactionController.createTransaction)
        .get(auth, transactionController.getTransactions);

    app.get('/api/transactions/dashboard', auth, transactionController.getDashboardStats);
};

module.exports = transactionRoutes;
