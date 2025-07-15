const SixJarsProfile = require('./sixJarsProfile.model');

const sixJarsProfileController = {
    // Get all preset profiles
    getPresetProfiles: async (req, res) => {
        try {
            const profiles = await SixJarsProfile.find({ isPreset: true, isActive: true });
            res.json(profiles);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching preset profiles', error: error.message });
        }
    },

    // Get all profiles (including custom ones for a user)
    getAllProfiles: async (req, res) => {
        try {
            const profiles = await SixJarsProfile.find({ isActive: true }).sort({ isPreset: -1, name: 1 });
            res.json(profiles);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching profiles', error: error.message });
        }
    },

    // Create a new custom profile
    createProfile: async (req, res) => {
        try {
            const { name, description, jarPercentages } = req.body;

            const newProfile = new SixJarsProfile({
                name,
                description,
                jarPercentages,
                isPreset: false,
                isActive: true,
            });

            await newProfile.save();
            res.status(201).json(newProfile);
        } catch (error) {
            res.status(500).json({ message: 'Error creating profile', error: error.message });
        }
    },

    // Update a profile
    updateProfile: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const profile = await SixJarsProfile.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            res.json(profile);
        } catch (error) {
            res.status(500).json({ message: 'Error updating profile', error: error.message });
        }
    },

    // Delete a profile (only custom profiles can be deleted)
    deleteProfile: async (req, res) => {
        try {
            const { id } = req.params;

            const profile = await SixJarsProfile.findById(id);
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            if (profile.isPreset) {
                return res.status(400).json({ message: 'Cannot delete preset profiles' });
            }

            await SixJarsProfile.findByIdAndDelete(id);
            res.json({ message: 'Profile deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting profile', error: error.message });
        }
    },

    // Get a specific profile by ID
    getProfileById: async (req, res) => {
        try {
            const { id } = req.params;
            const profile = await SixJarsProfile.findById(id);

            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            res.json(profile);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching profile', error: error.message });
        }
    },
};

module.exports = sixJarsProfileController; 