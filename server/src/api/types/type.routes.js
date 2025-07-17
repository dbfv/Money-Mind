const typeController = require('./type.controller');
const auth = require('../../middleware/auth');

const typeRoutes = (app) => {
    // GROUP ALL API ENDPOINTS (ROUTES) WITHOUT ID
    app.route('/api/types')
        .post(auth, typeController.createType)
        .get(auth, typeController.getTypes);

    // GROUP ALL API ENDPOINTS (ROUTES) WITH ID
    app.route('/api/types/:id')
        .get(auth, typeController.getTypeById)
        .put(auth, typeController.updateType)
        .delete(auth, typeController.deleteType);
};

module.exports = typeRoutes; 