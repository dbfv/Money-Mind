const sixJarsProfileController = require('./sixJarsProfile.controller');

const sixJarsProfileRoutes = (app) => {
    // GROUP ALL API ENDPOINTS (ROUTES) WITHOUT ID
    app.route('/api/six-jars-profiles')
        .get(sixJarsProfileController.getAllProfiles)
        .post(sixJarsProfileController.createProfile);

    // GROUP ALL API ENDPOINTS (ROUTES) WITH ID
    app.route('/api/six-jars-profiles/:id')
        .get(sixJarsProfileController.getProfileById)
        .put(sixJarsProfileController.updateProfile)
        .delete(sixJarsProfileController.deleteProfile);

    // SPECIAL ROUTES
    app.route('/api/six-jars-profiles/presets')
        .get(sixJarsProfileController.getPresetProfiles);
};

module.exports = sixJarsProfileRoutes; 