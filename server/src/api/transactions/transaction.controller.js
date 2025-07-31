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

    // Check if the expense would cause a negative balance
    if (type === 'expense' && sourceDoc.balance < amount) {
      throw new Error(`Insufficient funds in ${sourceDoc.name}. Current balance: $${sourceDoc.balance.toFixed(2)}`);
    }

    if (type === 'expense') {
      sourceDoc.balance -= amount;
    } else if (type === 'income') {
      sourceDoc.balance += amount;
    }

    // Ensure the source has a userId before saving
    if (!sourceDoc.userId) {
      sourceDoc.userId = req.user.id;
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
    const userId = req.user.id;
    console.log('Getting transactions for user:', userId);

    const transactions = await Transaction.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('category')
      .populate('source')
      .sort({ date: -1 }); // Sort by date descending

    console.log(`Found ${transactions.length} transactions`);
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

    // Fix date range calculation to get the correct current month
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January)

    // Create date objects with time set to midnight in UTC to avoid timezone issues
    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

    console.log('Dashboard request for user:', userId);
    console.log('Current date:', currentDate.toISOString());
    console.log('Date range:', {
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString()
    });

    // Get transactions for current month
    console.log('Searching for transactions with userId:', userId);
    console.log('Date range filters:', {
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString()
    });

    const monthlyTransactions = await Transaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startOfMonth, $lte: endOfMonth }
    })
      .populate('category')
      .populate('source');

    console.log('Found monthly transactions:', monthlyTransactions.length);
    console.log('Transaction sample:', monthlyTransactions.slice(0, 2));

    // Calculate financial summary
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const spending = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    console.log('Calculated financial summary:', { income, spending });

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
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          categoryName: { $first: '$categoryInfo.name' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    console.log('Spending by category aggregation results:', spendingByCategory);

    // Get cash flow data for last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Set to beginning of day

    console.log('Cash flow date range:', {
      thirtyDaysAgo: thirtyDaysAgo.toISOString(),
      today: today.toISOString()
    });

    const cashFlowTransactions = await Transaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    console.log(`Found ${cashFlowTransactions.length} transactions for cash flow data`);

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
    console.log('PUT /api/transactions/:id - Update transaction request');
    console.log('Transaction ID:', req.params.id);
    console.log('Request body:', req.body);

    // Validate required fields
    const { amount, type, date, description, category, source } = req.body;
    if (amount === undefined || !type || !date || !category || !source) {
      throw new Error('Missing required fields: amount, type, date, category, source are all required');
    }

    // Find the transaction
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      console.log('Transaction not found:', req.params.id);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    console.log('Found transaction:', transaction);
    console.log('User ID from token:', req.user.id);
    console.log('User ID from transaction:', transaction.userId.toString());

    if (transaction.userId.toString() !== req.user.id) {
      console.log('User not authorized');
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Verify source and category exist
    const sourceDoc = await Source.findById(source);
    if (!sourceDoc) {
      console.log('Source not found:', source);
      return res.status(400).json({ message: 'Source not found' });
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      console.log('Category not found:', category);
      return res.status(400).json({ message: 'Category not found' });
    }

    // If source is being changed or amount is different, we need to update both old and new source balances
    if (source !== transaction.source.toString() || amount !== transaction.amount) {
      console.log('Updating source balances - old source:', transaction.source, 'new source:', source);
      console.log('Old amount:', transaction.amount, 'New amount:', amount);

      // Revert the old source balance
      const oldSource = await Source.findById(transaction.source).session(session);
      if (!oldSource) {
        console.log('Old source not found:', transaction.source);
        return res.status(400).json({ message: 'Original source not found' });
      }

      console.log('Old source before update:', oldSource);
      if (transaction.type === 'expense') {
        oldSource.balance += transaction.amount;
      } else {
        oldSource.balance -= transaction.amount;
      }

      // Ensure the old source has a userId before saving
      if (!oldSource.userId) {
        oldSource.userId = req.user.id;
      }

      await oldSource.save({ session });
      console.log('Old source after update:', oldSource);

      // Update the new source balance
      const newSource = await Source.findById(source).session(session);
      if (!newSource) {
        console.log('New source not found:', source);
        return res.status(400).json({ message: 'New source not found' });
      }

      // Check if the expense would cause a negative balance
      if (type === 'expense' && newSource.balance < amount) {
        throw new Error(`Insufficient funds in ${newSource.name}. Current balance: $${newSource.balance.toFixed(2)}`);
      }

      console.log('New source before update:', newSource);
      if (type === 'expense') {
        newSource.balance -= amount;
      } else {
        newSource.balance += amount;
      }

      // Ensure the new source has a userId before saving
      if (!newSource.userId) {
        newSource.userId = req.user.id;
      }

      await newSource.save({ session });
      console.log('New source after update:', newSource);
    }

    // Update the transaction
    transaction.amount = amount;
    transaction.type = type;
    transaction.date = date;
    transaction.description = description;
    transaction.category = category;
    transaction.source = source;

    console.log('Saving updated transaction:', transaction);
    const updatedTransaction = await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    console.log('Transaction updated successfully');
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
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
    console.log('DELETE /api/transactions/:id');
    console.log('Transaction ID:', req.params.id);
    console.log('User ID from token:', req.user.id);

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      console.log('Transaction not found:', req.params.id);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    console.log('Found transaction:', transaction);
    console.log('Transaction user ID:', transaction.userId.toString());

    if (transaction.userId.toString() !== req.user.id) {
      console.log('User not authorized');
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Update source balance
    const source = await Source.findById(transaction.source).session(session);
    if (!source) {
      console.log('Source not found:', transaction.source);
      return res.status(400).json({ message: 'Source not found' });
    }

    console.log('Source before update:', source);
    if (transaction.type === 'expense') {
      source.balance += transaction.amount;
    } else {
      source.balance -= transaction.amount;
    }

    // Ensure the source has a userId before saving
    if (!source.userId) {
      source.userId = req.user.id;
    }

    await source.save({ session });
    console.log('Source after update:', source);

    // Delete the transaction
    const deleteResult = await Transaction.deleteOne({ _id: req.params.id }).session(session);
    console.log('Delete result:', deleteResult);

    await session.commitTransaction();
    session.endSession();

    console.log('Transaction deleted successfully');
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('category')
      .populate('source');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify the transaction belongs to the user
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this transaction' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
