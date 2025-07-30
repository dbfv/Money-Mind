const {
    getUsers,
    getUserById,
    registerUser,
    loginUser,
    updateUserSixJarsProfile,
    getUserProfile,
    updateUserProfile,
    updateInvestmentProfile,
    suggestInvestableIncome,
    changePassword,
    deleteAccount,
    updateUserAvatar
} = require('./user.controller');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/upload');

const userRoutes = (app) => {
    // Public routes
    app.route('/api/users')
        .post(registerUser);

    app.route('/api/users/login')
        .post(loginUser);

    // Profile routes - protected by auth middleware
    app.route('/api/users/profile')
        .get(auth, getUserProfile)
        .put(auth, updateUserProfile);

    app.route('/api/users/avatar')
        .put(auth, upload.single('avatar'), updateUserAvatar);

    app.route('/api/users/investment-profile')
        .put(auth, updateInvestmentProfile);

    app.route('/api/users/suggest-investable-income')
        .post(auth, suggestInvestableIncome);

    app.route('/api/users/change-password')
        .put(auth, changePassword);

    app.route('/api/users/account')
        .delete(auth, deleteAccount);

    // Admin routes - will need additional admin middleware in the future
    app.route('/api/users')
        .get(auth, getUsers);

    app.route('/api/users/:id')
        .get(auth, getUserById);

    // Six Jars profile route (to be deprecated)
    app.route('/api/users/:id/six-jars-profile')
        .put(auth, updateUserSixJarsProfile);
};

module.exports = userRoutes;
