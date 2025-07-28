const User = require('./user.model');
const SixJarsProfile = require('../sixJarsProfiles/sixJarsProfile.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    return jwt.sign({ id }, secret, {expiresIn: '30d',});
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

module.exports = {
    getUsers,
    getUserById,
    registerUser,
    loginUser,
    updateUserSixJarsProfile
};