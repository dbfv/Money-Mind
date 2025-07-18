const sourceController = require('./source.controller');
const auth = require('../../middleware/auth'); // Import the auth middleware

const sourceRoutes = (app) => {
    // GROUP ALL API ENDPOINTS (ROUTES) WITHOUT ID
    app.route('/api/sources')
        .post(auth, sourceController.createSource)
        .get(auth, sourceController.getSources);

    // GROUP ALL API ENDPOINTS (ROUTES) WITH ID
    app.route('/api/sources/:id')
        .get(auth, sourceController.getSourceById)
        .put(auth, sourceController.updateSource)
        .delete(auth, sourceController.deleteSource);

    app.get('/api/sources/total', auth, sourceController.getTotalAmount);
};

module.exports = sourceRoutes;
