const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserTransactions,
  getUserCategories,
  getUserSources,
  createUserCategory,
  createUserSource,
  updateUserCategory,
  updateUserSource,
  deleteUserCategory,
  deleteUserSource
} = require('./admin.controller');

const auth = require('../../middleware/auth');
const requireAdmin = require('../../middleware/adminAuth');

const adminRoutes = (app) => {
  // All admin routes require authentication + admin role
  const adminMiddleware = [auth, requireAdmin];

  // User management routes
  app.route('/api/admin/users')
    .get(adminMiddleware, getAllUsers);

  app.route('/api/admin/users/:id')
    .get(adminMiddleware, getUserById)
    .put(adminMiddleware, updateUser)
    .delete(adminMiddleware, deleteUser);

  // User's transactions
  app.route('/api/admin/users/:id/transactions')
    .get(adminMiddleware, getUserTransactions);

  // User's categories
  app.route('/api/admin/users/:id/categories')
    .get(adminMiddleware, getUserCategories)
    .post(adminMiddleware, createUserCategory);

  // User's sources
  app.route('/api/admin/users/:id/sources')
    .get(adminMiddleware, getUserSources)
    .post(adminMiddleware, createUserSource);

  // Category management (admin can edit any category)
  app.route('/api/admin/categories/:id')
    .put(adminMiddleware, updateUserCategory)
    .delete(adminMiddleware, deleteUserCategory);

  // Source management (admin can edit any source)
  app.route('/api/admin/sources/:id')
    .put(adminMiddleware, updateUserSource)
    .delete(adminMiddleware, deleteUserSource);
};

module.exports = adminRoutes;