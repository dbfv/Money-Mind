const cron = require('node-cron');
const { addDays, subMonths, format } = require('date-fns');
const aiService = require('./aiService');
const Transaction = require('../api/transactions/transaction.model');
const CalendarEvent = require('../api/calendarEvents/calendarEvent.model');
const User = require('../api/users/user.model');

class PredictionService {
    constructor() {
        this.isRunning = false;
        this.initializeCronJob();
    }

    /**
     * Initialize the cron job for bill prediction
     * Runs daily at 2 AM
     */
    initializeCronJob() {
        // Run daily at 2:00 AM
        cron.schedule('0 2 * * *', async () => {
            console.log('Starting daily bill prediction job...');
            await this.runDailyPredictions();
        });

        console.log('Bill prediction cron job initialized (daily at 2:00 AM)');
    }

    /**
     * Run predictions for all users
     */
    async runDailyPredictions() {
        if (this.isRunning) {
            console.log('Prediction job already running, skipping...');
            return;
        }

        this.isRunning = true;
        
        try {
            const users = await User.find({}, '_id');
            console.log(`Running predictions for ${users.length} users`);

            for (const user of users) {
                try {
                    await this.generatePredictionsForUser(user._id.toString());
                } catch (error) {
                    console.error(`Error generating predictions for user ${user._id}:`, error);
                }
            }

            console.log('Daily prediction job completed successfully');
        } catch (error) {
            console.error('Error in daily prediction job:', error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Generate predictions for a specific user
     * @param {string} userId - User ID
     */
    async generatePredictionsForUser(userId) {
        try {
            console.log(`Generating predictions for user: ${userId}`);

            // Get transaction history (last 6 months)
            const sixMonthsAgo = subMonths(new Date(), 6);
            const transactionHistory = await Transaction.find({
                userId: userId,
                date: { $gte: sixMonthsAgo },
                type: 'expense' // Focus on expenses for bill prediction
            })
            .populate('category', 'name type')
            .populate('source', 'name')
            .sort({ date: -1 })
            .lean();

            // Get existing scheduled bills/events
            const existingBills = await CalendarEvent.find({
                userId: userId,
                type: 'prediction',
                startDate: { $gte: new Date() }
            }).lean();

            // Skip if no transaction history
            if (transactionHistory.length === 0) {
                console.log(`No transaction history found for user ${userId}`);
                return;
            }

            // Use AI to predict recurring bills
            const predictions = await aiService.predictRecurringBills(
                transactionHistory,
                existingBills
            );

            console.log(`AI generated ${predictions.length} predictions for user ${userId}`);

            // Save predictions as calendar events
            for (const prediction of predictions) {
                await this.savePredictionAsEvent(userId, prediction);
            }

            console.log(`Saved predictions for user ${userId}`);
        } catch (error) {
            console.error(`Error generating predictions for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Save a prediction as a calendar event
     * @param {string} userId - User ID
     * @param {Object} prediction - Prediction object
     */
    async savePredictionAsEvent(userId, prediction) {
        try {
            // Check if similar prediction already exists
            const existingEvent = await CalendarEvent.findOne({
                userId: userId,
                title: prediction.title,
                type: 'prediction',
                startDate: {
                    $gte: new Date(),
                    $lte: addDays(new Date(prediction.nextDueDate), 7)
                }
            });

            if (existingEvent) {
                console.log(`Similar prediction already exists: ${prediction.title}`);
                return;
            }

            // Create new calendar event
            const calendarEvent = new CalendarEvent({
                userId: userId,
                title: prediction.title,
                description: `Predicted bill - ${prediction.pattern}\nConfidence: ${(prediction.confidence * 100).toFixed(0)}%`,
                amount: prediction.amount,
                type: 'prediction',
                startDate: new Date(prediction.nextDueDate),
                isRecurring: prediction.frequency !== 'irregular',
                frequency: prediction.frequency,
                metadata: {
                    confidence: prediction.confidence,
                    pattern: prediction.pattern,
                    aiGenerated: true,
                    generatedAt: new Date()
                }
            });

            await calendarEvent.save();
            console.log(`Saved prediction: ${prediction.title} for ${prediction.nextDueDate}`);
        } catch (error) {
            console.error(`Error saving prediction ${prediction.title}:`, error);
        }
    }

    /**
     * Manually trigger predictions for a user (for testing)
     * @param {string} userId - User ID
     */
    async triggerPredictionsForUser(userId) {
        console.log(`Manually triggering predictions for user: ${userId}`);
        await this.generatePredictionsForUser(userId);
    }

    /**
     * Clean up old predictions
     * @param {number} daysOld - Remove predictions older than this many days
     */
    async cleanupOldPredictions(daysOld = 30) {
        try {
            const cutoffDate = subMonths(new Date(), 1);
            
            const result = await CalendarEvent.deleteMany({
                type: 'prediction',
                startDate: { $lt: cutoffDate },
                'metadata.aiGenerated': true
            });

            console.log(`Cleaned up ${result.deletedCount} old predictions`);
            return result.deletedCount;
        } catch (error) {
            console.error('Error cleaning up old predictions:', error);
            throw error;
        }
    }
}

module.exports = new PredictionService();