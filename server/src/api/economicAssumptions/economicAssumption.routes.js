const economicAssumptionController = require('./economicAssumption.controller');

const economicAssumptionRoutes = (app) => {
    // GROUP ALL API ENDPOINTS (ROUTES) WITHOUT ID
    app.route('/api/economic-assumptions')
        .get(economicAssumptionController.getAllAssumptions)
        .put(economicAssumptionController.updateAssumptions);

    // SPECIAL ROUTES
    app.route('/api/economic-assumptions/active')
        .get(economicAssumptionController.getActiveAssumptions);
};

module.exports = economicAssumptionRoutes; 