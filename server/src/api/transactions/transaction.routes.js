const transactionController = require('./transaction.controller');
const auth = require('../../middleware/auth'); // Import the auth middleware

const transactionRoutes = (app) => {
    app.route('/api/transactions')
        .post(auth, transactionController.createTransaction)
        .get(auth, transactionController.getTransactions);

    // Specific routes should come before parameter routes
    app.get('/api/transactions/dashboard', auth, transactionController.getDashboardStats);

    app.route('/api/transactions/:id')
        .get(auth, transactionController.getTransactionById)
        .put(auth, transactionController.updateTransaction)
        .delete(auth, transactionController.deleteTransaction);
};

module.exports = transactionRoutes;
