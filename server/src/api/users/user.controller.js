// Import necessary modules and models
const User = require('./user.model');
const SixJarsProfile = require('../sixJarsProfiles/sixJarsProfile.model');
const jwt = require('jsonwebtoken');

/**
 * @desc    Generates a JSON Web Token (JWT) for a given user ID.
 *          The token is used to authenticate protected routes.
 * @param   {string} id - The user's ID.
 * @returns {string} The generated JWT.
 */
const generateToken = (id) => {
    // Use the JWT_SECRET from environment variables, or a default secret for development.
    // The token is set to expire in 30 days.
    const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024';
    return jwt.sign({ id }, secret, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register a new user in the system.
 * @route   POST /api/users
 * @access  Public
 * @param   {object} req - The request object from Express.
 * @param   {object} res - The response object from Express.
 */
const registerUser = async (req, res) => {
    // Destructure user data from the request body.
    const { name, email, password, age, sixJarsProfileId } = req.body;

    try {
        // Check if a user with the given email already exists.
        const userExists = await User.findOne({ email });

        if (userExists) {
            // If the user exists, return a 400 Bad Request error.
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // If no sixJarsProfileId is provided, assign a default profile.
        let profileId = sixJarsProfileId;
        if (!profileId) {
            // Try to find the "Standard Budget" preset profile.
            const defaultProfile = await SixJarsProfile.findOne({ isPreset: true, name: 'Standard Budget' });
            if (defaultProfile) {
                profileId = defaultProfile._id;
            } else {
                // If the standard profile doesn't exist, fall back to any other preset profile.
                const anyPreset = await SixJarsProfile.findOne({ isPreset: true });
                if (anyPreset) {
                    profileId = anyPreset._id;
                } else {
                    // If no preset profiles are available, allow registration without a profile.
                    // The user can set up their profile after their first login.
                    profileId = null;
                }
            }
        }

        // Create a new user with the provided data.
        const user = await User.create({
            name,
            email,
            password,
            age,
            sixJarsProfileId: profileId
        });

        if (user) {
            // If the user is created successfully, return a 201 Created response.
            // The user will need to log in to get a JWT.
            res.status(201).json({
                message: 'User registered successfully. Please login to continue.',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                }
            });
        } else {
            // If user creation fails, return a 400 Bad Request error.
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        // If an unexpected error occurs, return a 500 Internal Server Error.
        res.status(500).json({ message: error.message });
    }
};


/**
 * @desc    Get all users from the database.
 * @route   GET /api/users
 * @access  Private (should be protected by authentication middleware)
 * @param   {object} req - The request object from Express.
 * @param   {object} res - The response object from Express.
 */
const getUsers = async (req, res) => {
    try {
        // Fetch all users and populate their 'sixJarsProfileId' field with the corresponding profile data.
        const users = await User.find().populate('sixJarsProfileId');
        res.json(users);
    } catch (err) {
        // If an error occurs, return a 500 Internal Server Error.
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc    Get a single user by their ID.
 * @route   GET /api/users/:id
 * @access  Private (should be protected by authentication middleware)
 * @param   {object} req - The request object from Express.
 * @param   {object} res - The response object from Express.
 */
const getUserById = async (req, res) => {
    try {
        // Find the user by the ID from the request parameters and populate their profile data.
        const user = await User.findById(req.params.id).populate('sixJarsProfileId');
        if (!user) {
            // If the user is not found, return a 404 Not Found error.
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        // If an error occurs, return a 500 Internal Server Error.
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc    Update a user's Six Jars profile.
 * @route   PUT /api/users/:id/six-jars-profile
 * @access  Private (should be protected by authentication middleware)
 * @param   {object} req - The request object from Express.
 * @param   {object} res - The response object from Express.
 */
const updateUserSixJarsProfile = async (req, res) => {
    try {
        // Get the new profile ID from the request body.
        const { sixJarsProfileId } = req.body;

        // Verify that the provided profile ID corresponds to an existing profile.
        const profile = await SixJarsProfile.findById(sixJarsProfileId);
        if (!profile) {
            return res.status(404).json({ message: 'Six jars profile not found' });
        }

        // Find the user by ID and update their 'sixJarsProfileId'.
        // { new: true } ensures that the updated user document is returned.
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { sixJarsProfileId },
            { new: true }
        ).populate('sixJarsProfileId');

        if (!user) {
            // If the user is not found, return a 404 Not Found error.
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the updated user object.
        res.json(user);
    } catch (err) {
        // If an error occurs, return a 500 Internal Server Error.
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc    Authenticate a user and get a token.
 * @route   POST /api/users/login
 * @access  Public
 * @param   {object} req - The request object from Express.
 * @param   {object} res - The response object from Express.
 */
const loginUser = async (req, res) => {
    // Get email and password from the request body.
    const { email, password } = req.body;

    try {
        // Find the user by email.
        const user = await User.findOne({ email });

        if (!user) {
            // If the user is not found, return a 401 Unauthorized error.
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Use the 'comparePassword' method from the user model to check if the password is correct.
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            // If the passwords don't match, return a 401 Unauthorized error.
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If the credentials are correct, generate a JWT and return it to the client.
        // Also return some basic user information.
        res.json({
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        // If an unexpected error occurs, return a 500 Internal Server Error.
        res.status(500).json({ message: error.message });
    }
};

// Export the controller functions to be used in the user routes file.
module.exports = {
    getUsers,
    getUserById,
    registerUser,
    loginUser,
    updateUserSixJarsProfile
};