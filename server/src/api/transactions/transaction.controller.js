const Transaction = require('./transaction.model');
const Source = require('../sources/source.model');
const Category = require('../categories/category.model');
const mongoose = require('mongoose');

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, type, date, description, category, source } = req.body;

    // Validate category ObjectId
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new Error('Invalid category ID');
    }
    // Check if category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      throw new Error('Category not found');
    }

    // 1. Create the transaction
    const transaction = new Transaction({
      userId: req.user.id,
      amount,
      type,
      date,
      description,
      category,
      source,
    });

    const createdTransaction = await transaction.save({ session });

    // 2. Update the source balance
    const sourceDoc = await Source.findById(source).session(session);
    if (!sourceDoc) {
      throw new Error('Source not found');
    }

    if (type === 'expense') {
      sourceDoc.balance -= amount;
    } else if (type === 'income') {
      sourceDoc.balance += amount;
    }

    await sourceDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdTransaction);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate('category')
      .populate('source')
      .sort({ date: -1 }); // Sort by date descending
    res.json(transactions);
  } catch (error) {
    console.error('Transactions error:', error); // Debug log
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/transactions/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    console.log('Dashboard request for user:', userId); // Debug log
    console.log('Date range:', { startOfMonth, endOfMonth }); // Debug log

    // Get transactions for current month
    const monthlyTransactions = await Transaction.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    })
      .populate('category')
      .populate('source');

    // Calculate financial summary
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const spending = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netFlow = income - spending;

    // Calculate spending by category
    const spendingByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $lookup: {
          from: 'categories',  // Lowercase collection name as MongoDB automatically lowercases it
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          categoryName: { $first: { $arrayElemAt: ['$categoryInfo.name', 0] } }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Get cash flow data for last 30 days
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const cashFlowTransactions = await Transaction.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    // Calculate running balance
    let balance = 0;
    const cashFlowData = [];
    const dailyBalances = {};

    cashFlowTransactions.forEach(transaction => {
      const dateKey = transaction.date.toISOString().split('T')[0];
      if (!dailyBalances[dateKey]) {
        dailyBalances[dateKey] = 0;
      }

      if (transaction.type === 'income') {
        dailyBalances[dateKey] += transaction.amount;
      } else {
        dailyBalances[dateKey] -= transaction.amount;
      }
    });

    // Create cash flow data points
    for (let i = 0; i < 30; i++) {
      const date = new Date(currentDate.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      balance += dailyBalances[dateKey] || 0;

      cashFlowData.push({
        date: dateKey,
        balance: Math.max(0, balance) // Ensure balance doesn't go negative in display
      });
    }

    // Get total amount from all sources
    const sources = await Source.find({ userId: userId });
    const totalAmount = sources.reduce((sum, src) => sum + (src.balance || 0), 0);

    // 6 jars analysis (default percentages, can be customized per user in future)
    const jarsPercents = [0.55, 0.1, 0.1, 0.1, 0.1, 0.05]; // Example: Necessities, Play, Education, Financial Freedom, Long-term Savings, Give
    const jarsLabels = ['Necessities', 'Play', 'Education', 'Financial Freedom', 'Long-term Savings', 'Give'];
    const jars = jarsPercents.map((percent, i) => ({
      label: jarsLabels[i],
      amount: Math.round(totalAmount * percent * 100) / 100,
      percent: percent * 100
    }));

    res.json({
      financialSummary: {
        income,
        spending,
        netFlow
      },
      spendingByCategory: spendingByCategory.map(item => ({
        category: item.categoryName || 'Unknown',
        amount: item.total,
        percentage: spending > 0 ? (item.total / spending) * 100 : 0
      })),
      cashFlowData,
      totalAmount,
      jars
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, type, date, description, category, source } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.userId.toString() !== req.user.id) {
      throw new Error('User not authorized');
    }

    // If source is being changed or amount is different, we need to update both old and new source balances
    if (source !== transaction.source.toString() || amount !== transaction.amount) {
      // Revert the old source balance
      const oldSource = await Source.findById(transaction.source).session(session);
      if (transaction.type === 'expense') {
        oldSource.balance += transaction.amount;
      } else {
        oldSource.balance -= transaction.amount;
      }
      await oldSource.save({ session });

      // Update the new source balance
      const newSource = await Source.findById(source || transaction.source).session(session);
      if (type === 'expense') {
        newSource.balance -= amount;
      } else {
        newSource.balance += amount;
      }
      await newSource.save({ session });
    }

    // Update the transaction
    transaction.amount = amount;
    transaction.type = type;
    transaction.date = date;
    transaction.description = description;
    transaction.category = category;
    transaction.source = source || transaction.source;

    const updatedTransaction = await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json(updatedTransaction);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.userId.toString() !== req.user.id) {
      throw new Error('User not authorized');
    }

    // Update source balance
    const source = await Source.findById(transaction.source).session(session);
    if (transaction.type === 'expense') {
      source.balance += transaction.amount;
    } else {
      source.balance -= transaction.amount;
    }
    await source.save({ session });

    // Delete the transaction
    await Transaction.deleteOne({ _id: req.params.id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Transaction removed' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};
