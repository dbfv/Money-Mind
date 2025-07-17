const Type = require('./type.model');

// @desc    Create a type
// @route   POST /api/types
// @access  Private
exports.createType = async (req, res) => {
    try {
        const type = new Type({
            ...req.body,
            userId: req.user.id,
        });
        const createdType = await type.save();
        res.status(201).json(createdType);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all types for a user
// @route   GET /api/types
// @access  Private
exports.getTypes = async (req, res) => {
    try {
        const types = await Type.find({ userId: req.user.id });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a type by ID
// @route   GET /api/types/:id
// @access  Private
exports.getTypeById = async (req, res) => {
    try {
        const type = await Type.findById(req.params.id);

        if (type && type.userId.toString() === req.user.id) {
            res.json(type);
        } else {
            res.status(404).json({ message: 'Type not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a type
// @route   PUT /api/types/:id
// @access  Private
exports.updateType = async (req, res) => {
    try {
        const type = await Type.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type not found' });
        }
        if (type.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        const { name, type: typeValue } = req.body;
        type.name = name || type.name;
        type.type = typeValue || type.type;

        const updatedType = await type.save();
        res.json(updatedType);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a type
// @route   DELETE /api/types/:id
// @access  Private
exports.deleteType = async (req, res) => {
    try {
        const type = await Type.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type not found' });
        }
        if (type.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        await Type.deleteOne({ _id: req.params.id });
        res.json({ message: 'Type removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 