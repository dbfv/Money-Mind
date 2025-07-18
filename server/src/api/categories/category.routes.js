const categoryController = require('./category.controller');
const auth = require('../../middleware/auth');

const categoryRoutes = (app) => {
    app.route('/api/categories')
        .post(auth, categoryController.createCategory)
        .get(auth, categoryController.getCategories);

    app.route('/api/categories/:id')
        .get(auth, categoryController.getCategoryById)
        .put(auth, categoryController.updateCategory)
        .delete(auth, categoryController.deleteCategory);
};

module.exports = categoryRoutes; 