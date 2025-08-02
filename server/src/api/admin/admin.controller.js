const User = require('../users/user.model');
const Transaction = require('../transactions/transaction.model');
const Category = require('../categories/category.model');
const Source = require('../sources/source.model');
const mongoose = require('mongoose');

// @desc    Get all users with pagination and search
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build search query
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object - prioritize admins first, then by selected field
    const sort = {};
    if (sortBy === 'role') {
      sort.role = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.role = -1; // Admins first (admin comes before user alphabetically when reversed)
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Get users with pagination
    const users = await User.find(searchQuery)
      .select('-password') // Exclude password
      .populate('sixJarsProfileId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID with detailed info
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('sixJarsProfileId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's transaction summary
    const transactionStats = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user's categories and sources count
    const categoriesCount = await Category.countDocuments({ userId: req.params.id });
    const sourcesCount = await Source.countDocuments({ userId: req.params.id });

    res.json({
      user,
      stats: {
        transactions: transactionStats,
        categoriesCount,
        sourcesCount
      }
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (admin can update any field including role)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, age, role } = req.body;

    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (age) updateData.age = age;
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password').populate('sixJarsProfileId');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user and all associated data
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all associated data
    await Transaction.deleteMany({ user: req.params.id }).session(session);
    await Category.deleteMany({ userId: req.params.id }).session(session);
    await Source.deleteMany({ userId: req.params.id }).session(session);

    // Delete the user
    await User.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's transactions
// @route   GET /api/admin/users/:id/transactions
// @access  Private/Admin
const getUserTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;
    
    // Build filter query
    const filter = { user: req.params.id };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(filter)
      .populate('category', 'name type')
      .populate('source', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting user transactions:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's categories
// @route   GET /api/admin/users/:id/categories
// @access  Private/Admin
const getUserCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.params.id })
      .sort({ name: 1 });

    res.json({ categories });
  } catch (error) {
    console.error('Error getting user categories:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's sources
// @route   GET /api/admin/users/:id/sources
// @access  Private/Admin
const getUserSources = async (req, res) => {
  try {
    const sources = await Source.find({ userId: req.params.id })
      .sort({ name: 1 });

    res.json({ sources });
  } catch (error) {
    console.error('Error getting user sources:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category for user
// @route   POST /api/admin/users/:id/categories
// @access  Private/Admin
const createUserCategory = async (req, res) => {
  try {
    const { name, type, sixJarsCategory, color } = req.body;

    const category = await Category.create({
      name,
      type,
      sixJarsCategory,
      color,
      userId: req.params.id
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create source for user
// @route   POST /api/admin/users/:id/sources
// @access  Private/Admin
const createUserSource = async (req, res) => {
  try {
    const { name, type } = req.body;

    const source = await Source.create({
      name,
      type,
      userId: req.params.id
    });

    res.status(201).json({
      message: 'Source created successfully',
      source
    });
  } catch (error) {
    console.error('Error creating source:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user's category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateUserCategory = async (req, res) => {
  try {
    const { name, type, sixJarsCategory, color } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, type, sixJarsCategory, color },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user's source
// @route   PUT /api/admin/sources/:id
// @access  Private/Admin
const updateUserSource = async (req, res) => {
  try {
    const { name, type } = req.body;

    const source = await Source.findByIdAndUpdate(
      req.params.id,
      { name, type },
      { new: true }
    );

    if (!source) {
      return res.status(404).json({ message: 'Source not found' });
    }

    res.json({
      message: 'Source updated successfully',
      source
    });
  } catch (error) {
    console.error('Error updating source:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user's category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteUserCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user's source
// @route   DELETE /api/admin/sources/:id
// @access  Private/Admin
const deleteUserSource = async (req, res) => {
  try {
    const source = await Source.findByIdAndDelete(req.params.id);

    if (!source) {
      return res.status(404).json({ message: 'Source not found' });
    }

    res.json({ message: 'Source deleted successfully' });
  } catch (error) {
    console.error('Error deleting source:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};