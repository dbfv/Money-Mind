const User = require('../api/users/user.model');

const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (from auth middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user from database to check role
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Add user data to request for convenience
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Error in admin auth middleware:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = requireAdmin;