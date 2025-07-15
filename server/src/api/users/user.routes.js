const { getUsers, getUserById, registerUser, loginUser, updateUserSixJarsProfile } = require('./user.controller');

const userRoutes = (app) => {
    // GROUP ALL API ENDPOINTS (ROUTES) WITHOUT ID
    app.route('/api/users')
        .post(registerUser)
        .get(getUsers);

    // LOGIN ROUTE
    app.route('/api/users/login')
        .post(loginUser);

    // GROUP ALL API ENDPOINTS (ROUTES) WITH ID
    app.route('/api/users/:id')
        .get(getUserById);

    // SPECIAL ROUTES
    app.route('/api/users/:id/six-jars-profile')
        .put(updateUserSixJarsProfile);
};

module.exports = userRoutes;
