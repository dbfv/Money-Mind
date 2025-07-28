const Source = require('./source.model');

// @desc    Create a source
// @route   POST /api/sources
// @access  Private
exports.createSource = async (req, res) => {
  try {
    // Check for existing source with same name for this user
    const existingSource = await Source.findOne({
      userId: req.user.id,
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } // Case insensitive match
    });

    if (existingSource) {
      return res.status(400).json({ message: 'A source with this name already exists' });
    }

    const source = new Source({
      ...req.body,
      userId: req.user.id,
    });
    const createdSource = await source.save();
    res.status(201).json(createdSource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all sources for a user
// @route   GET /api/sources
// @access  Private
exports.getSources = async (req, res) => {
  try {
    const sources = await Source.find({ userId: req.user.id });
    res.json(sources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a source by ID
// @route   GET /api/sources/:id
// @access  Private
exports.getSourceById = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);

    if (source && source.userId.toString() === req.user.id) {
      res.json(source);
    } else {
      res.status(404).json({ message: 'Source not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a source
// @route   PUT /api/sources/:id
// @access  Private
exports.updateSource = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);
    if (!source) {
      return res.status(404).json({ message: 'Source not found' });
    }
    if (source.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // If name is being changed, check for duplicates
    if (req.body.name && req.body.name !== source.name) {
      const existingSource = await Source.findOne({
        userId: req.user.id,
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: req.params.id } // Exclude current source
      });

      if (existingSource) {
        return res.status(400).json({ message: 'A source with this name already exists' });
      }
    }

    // Ensure userId is preserved and not overwritten
    const updateData = { ...req.body };
    updateData.userId = req.user.id;  // Always use the userId from the token

    const updatedSource = await Source.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedSource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a source
// @route   DELETE /api/sources/:id
// @access  Private
exports.deleteSource = async (req, res) => {
  try {
    // Debug logging
    console.log('DELETE /api/sources/:id');
    console.log('Authorization header:', req.headers['authorization']);
    console.log('Decoded user:', req.user);
    console.log('Source ID:', req.params.id);

    if (!req.user || !req.user.id) {
      console.log('No token or user ID');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const source = await Source.findById(req.params.id);
    if (!source) {
      console.log('Source not found');
      return res.status(404).json({ message: 'Source not found' });
    }
    console.log('Source userId:', source.userId.toString(), 'Request user:', req.user.id);
    if (source.userId.toString() !== req.user.id) {
      console.log('Permission denied');
      return res.status(403).json({ message: 'Permission denied' });
    }
    await Source.deleteOne({ _id: req.params.id });
    console.log('Source removed');
    res.json({ message: 'Source removed' });
  } catch (error) {
    console.error('Delete source error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total amount from all sources for a user
// @route   GET /api/sources/total
// @access  Private
exports.getTotalAmount = async (req, res) => {
  try {
    const sources = await Source.find({ userId: req.user.id });
    const total = sources.reduce((sum, src) => sum + (src.balance || 0), 0);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
