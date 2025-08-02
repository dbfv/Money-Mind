const User = require('./user.model');
const PasswordReset = require('./passwordReset.model');
const SixJarsProfile = require('../sixJarsProfiles/sixJarsProfile.model');
const Transaction = require('../transactions/transaction.model');
const Category = require('../categories/category.model');
const Source = require('../sources/source.model');
const CalendarEvent = require('../calendarEvents/calendarEvent.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cloudinary = require('../../config/cloudinary');
const { sendPasswordResetEmail } = require('../../services/emailService');
const crypto = require('crypto');

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    return jwt.sign({ id }, secret, { expiresIn: '30d', });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, age, sixJarsProfileId } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Get default profile if none provided
        let profileId = sixJarsProfileId;
        if (!profileId) {
            const defaultProfile = await SixJarsProfile.findOne({ isPreset: true, name: 'Standard Budget' });
            if (defaultProfile) {
                profileId = defaultProfile._id;
            } else {
                // Fallback to any preset profile
                const anyPreset = await SixJarsProfile.findOne({ isPreset: true });
                if (anyPreset) {
                    profileId = anyPreset._id;
                } else {
                    // For now, allow registration without a profile
                    // Users can set up their profile after first login
                    profileId = null;
                }
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            age,
            sixJarsProfileId: profileId
        });

        if (user) {
            // Registration successful - user needs to login to get JWT token
            res.status(201).json({
                message: 'User registered successfully. Please login to continue.',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('sixJarsProfileId');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get user by ID with populated data
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('sixJarsProfileId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update user's six jars profile
// @route   PUT /api/users/:id/six-jars-profile
// @access  Private
const updateUserSixJarsProfile = async (req, res) => {
    try {
        const { sixJarsProfileId } = req.body;

        // Verify the profile exists
        const profile = await SixJarsProfile.findById(sixJarsProfileId);
        if (!profile) {
            return res.status(404).json({ message: 'Six jars profile not found' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { sixJarsProfileId },
            { new: true }
        ).populate('sixJarsProfileId');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        // req.user.id comes from the auth middleware
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (basic info)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const { name, age } = req.body;

        // Validate input
        if (name && name.trim() === '') {
            return res.status(400).json({ message: 'Name cannot be empty' });
        }

        if (age && (isNaN(age) || age < 18 || age > 120)) {
            return res.status(400).json({ message: 'Age must be a valid number between 18 and 120' });
        }

        // Update only provided fields
        const updateData = {};
        if (name) updateData.name = name;
        if (age) updateData.age = age;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user investment profile
// @route   PUT /api/users/investment-profile
// @access  Private
const updateInvestmentProfile = async (req, res) => {
    try {
        const { riskTolerance, monthlyInvestableIncome, inflationRate, bankInterestRate } = req.body;

        // Validate risk tolerance
        if (riskTolerance !== undefined) {
            const riskToleranceNum = Number(riskTolerance);
            if (isNaN(riskToleranceNum) || riskToleranceNum < 1 || riskToleranceNum > 100) {
                return res.status(400).json({ message: 'Risk tolerance must be a number between 1 and 100' });
            }
        }

        // Validate monthly investable income
        if (monthlyInvestableIncome !== undefined) {
            const income = Number(monthlyInvestableIncome);
            if (isNaN(income) || income < 0) {
                return res.status(400).json({ message: 'Monthly investable income must be a non-negative number' });
            }
        }

        // Validate inflation rate
        if (inflationRate !== undefined) {
            const rate = Number(inflationRate);
            if (isNaN(rate) || rate < 0) {
                return res.status(400).json({ message: 'Inflation rate must be a non-negative number' });
            }
        }

        // Validate bank interest rate
        if (bankInterestRate !== undefined) {
            const rate = Number(bankInterestRate);
            if (isNaN(rate) || rate < 0) {
                return res.status(400).json({ message: 'Bank interest rate must be a non-negative number' });
            }
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update investment profile with validated values
        if (riskTolerance !== undefined) user.investmentProfile.riskTolerance = Number(riskTolerance);
        if (monthlyInvestableIncome !== undefined) user.investmentProfile.monthlyInvestableIncome = Number(monthlyInvestableIncome);

        // Initialize economicAssumptions if it doesn't exist
        if (!user.investmentProfile.economicAssumptions) {
            user.investmentProfile.economicAssumptions = {
                inflationRate: 2.5,
                bankInterestRate: 1.0
            };
        }

        // Update economic assumptions if provided
        if (inflationRate !== undefined) user.investmentProfile.economicAssumptions.inflationRate = Number(inflationRate);
        if (bankInterestRate !== undefined) user.investmentProfile.economicAssumptions.bankInterestRate = Number(bankInterestRate);

        await user.save();

        res.status(200).json({
            message: 'Investment profile updated successfully',
            investmentProfile: user.investmentProfile
        });
    } catch (error) {
        console.error('Error updating investment profile:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Suggest investable income based on user data
// @route   POST /api/users/suggest-investable-income
// @access  Private
const suggestInvestableIncome = async (req, res) => {
    try {
        // Get user and their risk tolerance
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const riskTolerance = user.investmentProfile.riskTolerance; // 1-100 scale

        // Get transactions from the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const transactions = await Transaction.find({
            user: req.user.id,
            date: { $gte: threeMonthsAgo }
        }).populate('category');

        if (transactions.length === 0) {
            return res.status(200).json({
                suggestedIncome: 0,
                message: 'Not enough transaction history to make a suggestion'
            });
        }

        // Calculate average monthly income and expenses
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'income' ||
                (transaction.category && transaction.category.type === 'income')) {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
        });

        // Monthly averages (over 3 months)
        const avgMonthlyIncome = totalIncome / 3;
        const avgMonthlyExpense = totalExpense / 3;

        // Calculate discretionary income
        const discretionaryIncome = Math.max(0, avgMonthlyIncome - avgMonthlyExpense);

        // Calculate suggested investable income based on risk tolerance
        // Map risk tolerance (1-100) to percentage (5-30%)
        const minPercentage = 5; // Minimum 5% even for lowest risk tolerance
        const maxPercentage = 30; // Maximum 30% for highest risk tolerance

        // Linear interpolation from minPercentage to maxPercentage based on risk tolerance
        const investmentPercentage = minPercentage + ((maxPercentage - minPercentage) * (riskTolerance - 1) / 99);

        // Calculate suggested income
        const suggestedIncome = Math.floor(discretionaryIncome * (investmentPercentage / 100));

        // Update user with AI suggested income
        user.investmentProfile.aiSuggestedIncome = suggestedIncome;
        await user.save();

        return res.status(200).json({
            suggestedIncome,
            investmentPercentage,
            discretionaryIncome,
            avgMonthlyIncome,
            avgMonthlyExpense,
            message: 'Investable income suggestion calculated successfully'
        });

    } catch (error) {
        console.error('Error suggesting investable income:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters long' });
        }

        // Get user with password
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if current password is correct
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find user first to confirm they exist
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all associated data
        await Transaction.deleteMany({ userId: req.user.id }).session(session);
        await Category.deleteMany({ userId: req.user.id }).session(session);
        await Source.deleteMany({ userId: req.user.id }).session(session);
        await CalendarEvent.deleteMany({ userId: req.user.id }).session(session);

        // Finally delete the user
        await User.findByIdAndDelete(req.user.id).session(session);

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.json({ message: 'Account and all associated data deleted successfully' });
    } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();

        console.error('Error deleting account:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateUserAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Get the user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user already has an avatar, delete it from Cloudinary
        if (user.avatar && user.avatar.includes('cloudinary')) {
            // Extract the public_id from the URL
            const publicId = user.avatar.split('/').pop().split('.')[0];
            try {
                await cloudinary.uploader.destroy(`avatars/${publicId}`);
            } catch (err) {
                console.error('Error deleting previous avatar from Cloudinary:', err);
                // Continue with the upload even if delete fails
            }
        }

        // Upload the new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'avatars',
            transformation: [
                { width: 250, height: 250, crop: 'fill' },
                { quality: 'auto' }
            ]
        });

        // Update the user's avatar field with the new URL
        user.avatar = result.secure_url;
        await user.save();

        res.json({
            message: 'Avatar updated successfully',
            avatar: user.avatar
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save reset token to database
    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
      email: user.email,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @desc    Verify reset token
// @route   GET /api/users/reset-password/:token
// @access  Public
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Find valid reset token
    const resetRequest = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'name email');

    if (!resetRequest) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    res.json({
      valid: true,
      email: resetRequest.email,
      userName: resetRequest.userId.name
    });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Find valid reset token
    const resetRequest = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRequest) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Find user and update password
    const user = await User.findById(resetRequest.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    // Mark reset token as used
    resetRequest.used = true;
    await resetRequest.save();

    res.json({ 
      message: 'Password reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = {
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
    updateUserAvatar,
    forgotPassword,
    verifyResetToken,
    resetPassword
};