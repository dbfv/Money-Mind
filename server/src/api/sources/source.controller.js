const Source = require('./source.model');

// @desc    Create a source
// @route   POST /api/sources
// @access  Private
exports.createSource = async (req, res) => {
  try {
    const source = new Source({
      ...req.body,
      user: req.user.id,
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
    const sources = await Source.find({ user: req.user.id });
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

    if (source && source.user.toString() === req.user.id) {
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

    if (source && source.user.toString() === req.user.id) {
      const { name, type, balance, status, interestRate, transferTime, category } = req.body;
      source.name = name || source.name;
      source.type = type || source.type;
      source.balance = balance || source.balance;
      source.status = status || source.status;
      source.interestRate = interestRate || source.interestRate;
      source.transferTime = transferTime || source.transferTime;
      source.category = category || source.category;

      const updatedSource = await source.save();
      res.json(updatedSource);
    } else {
      res.status(404).json({ message: 'Source not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a source
// @route   DELETE /api/sources/:id
// @access  Private
exports.deleteSource = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);

    if (source && source.user.toString() === req.user.id) {
      await source.remove();
      res.json({ message: 'Source removed' });
    } else {
      res.status(404).json({ message: 'Source not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total amount from all sources for a user
// @route   GET /api/sources/total
// @access  Private
exports.getTotalAmount = async (req, res) => {
  try {
    const sources = await Source.find({ user: req.user.id });
    const total = sources.reduce((sum, src) => sum + (src.balance || 0), 0);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
