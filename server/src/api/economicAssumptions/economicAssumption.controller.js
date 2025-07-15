const EconomicAssumption = require('./economicAssumption.model');

const economicAssumptionController = {
    // Get the active economic assumptions
    getActiveAssumptions: async (req, res) => {
        try {
            const assumptions = await EconomicAssumption.findOne({ isActive: true });
            if (!assumptions) {
                return res.status(404).json({ message: 'No active economic assumptions found' });
            }
            res.json(assumptions);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching economic assumptions', error: error.message });
        }
    },

    // Update economic assumptions (admin only)
    updateAssumptions: async (req, res) => {
        try {
            const { inflationRate, bankInterestRate, marketReturnRate, taxRate } = req.body;

            // Deactivate all current assumptions
            await EconomicAssumption.updateMany({}, { isActive: false });

            // Create new active assumptions
            const newAssumptions = new EconomicAssumption({
                inflationRate,
                bankInterestRate,
                marketReturnRate,
                taxRate,
                isActive: true,
            });

            await newAssumptions.save();
            res.json(newAssumptions);
        } catch (error) {
            res.status(500).json({ message: 'Error updating economic assumptions', error: error.message });
        }
    },

    // Get all economic assumptions (for admin)
    getAllAssumptions: async (req, res) => {
        try {
            const assumptions = await EconomicAssumption.find().sort({ createdAt: -1 });
            res.json(assumptions);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching all economic assumptions', error: error.message });
        }
    },
};

module.exports = economicAssumptionController; 