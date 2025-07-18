const transactionController = require('./transaction.controller');
const auth = require('../../middleware/auth'); // Import the auth middleware

const transactionRoutes = (app) => {
    app.route('/api/transactions')
        .post(auth, transactionController.createTransaction)
        .get(auth, transactionController.getTransactions);

    // Place this above the /:id route!
    app.get('/api/transactions/dashboard', auth, transactionController.getDashboardStats);

    app.route('/api/transactions/:id')
        .get(auth, transactionController.getTransactionById);
};

module.exports = transactionRoutes;
