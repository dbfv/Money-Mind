const Category = require('./category.model');

// @desc    Create a category
// @route   POST /api/categories
// @access  Private
exports.createType = async (req, res) => {
    try {
        // Check for existing category with same name for this user
        const existingCategory = await Category.findOne({
            userId: req.user.id,
            name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } // Case insensitive match
        });

        if (existingCategory) {
            return res.status(400).json({ message: 'A category with this name already exists' });
        }

        const category = new Category({
            ...req.body,
            userId: req.user.id,
        });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.user.id });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a category by ID
// @route   GET /api/categories/:id
// @access  Private
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category && category.userId.toString() === req.user.id) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateType = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (category.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        // If name is being changed, check for duplicates
        if (req.body.name && req.body.name !== category.name) {
            const existingCategory = await Category.findOne({
                userId: req.user.id,
                name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
                _id: { $ne: req.params.id } // Exclude current category
            });

            if (existingCategory) {
                return res.status(400).json({ message: 'A category with this name already exists' });
            }
        }

        const { name, type } = req.body;
        category.name = name || category.name;
        category.type = type || category.type;
        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (category.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        await Category.deleteOne({ _id: req.params.id });
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 