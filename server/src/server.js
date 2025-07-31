const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const userRoutes = require('./api/users/user.routes');
const sourceRoutes = require('./api/sources/source.routes');
const transactionRoutes = require('./api/transactions/transaction.routes');
const economicAssumptionRoutes = require('./api/economicAssumptions/economicAssumption.routes');
const sixJarsProfileRoutes = require('./api/sixJarsProfiles/sixJarsProfile.routes');
const categoryRoutes = require('./api/categories/category.routes');
const calendarEventRoutes = require('./api/calendarEvents/calendarEvent.routes');
const aiService = require('./services/aiService');
const predictionService = require('./services/predictionService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});
const port = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Routes
userRoutes(app);
sourceRoutes(app);
transactionRoutes(app);
economicAssumptionRoutes(app);
sixJarsProfileRoutes(app);
categoryRoutes(app);
calendarEventRoutes(app);

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat_message', async (data) => {
    try {
      const { userId, message } = data;
      
      if (!userId || !message) {
        socket.emit('chat_response', {
          error: 'Missing userId or message'
        });
        return;
      }

      // Get user's categories and sources
      const Category = require('./api/categories/category.model');
      const Source = require('./api/sources/source.model');
      
      const [userCategories, userSources] = await Promise.all([
        Category.find({ userId }).lean(),
        Source.find({ userId }).lean()
      ]);

      // Process message with AI
      const response = await aiService.processChatMessage(
        userId, 
        message, 
        userCategories, 
        userSources
      );

      socket.emit('chat_response', response);
    } catch (error) {
      console.error('Error processing chat message:', error);
      socket.emit('chat_response', {
        type: 'error',
        message: 'Sorry, I encountered an error processing your message.'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// AI Routes
app.post('/api/ai/investment-suggestion', async (req, res) => {
  try {
    const { userProfile, transactionSummary } = req.body;
    
    if (!userProfile || !transactionSummary) {
      return res.status(400).json({ 
        message: 'userProfile and transactionSummary are required' 
      });
    }

    const suggestions = await aiService.generateInvestmentSuggestion(
      userProfile, 
      transactionSummary
    );

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating investment suggestions:', error);
    res.status(500).json({ 
      message: 'Error generating investment suggestions',
      error: error.message 
    });
  }
});

// Manual prediction trigger (for testing)
app.post('/api/ai/trigger-predictions', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    await predictionService.triggerPredictionsForUser(userId);
    
    res.json({ message: 'Predictions triggered successfully' });
  } catch (error) {
    console.error('Error triggering predictions:', error);
    res.status(500).json({ 
      message: 'Error triggering predictions',
      error: error.message 
    });
  }
});

// Cleanup old predictions
app.delete('/api/ai/cleanup-predictions', async (req, res) => {
  try {
    const { daysOld = 30 } = req.query;
    
    const deletedCount = await predictionService.cleanupOldPredictions(
      parseInt(daysOld)
    );
    
    res.json({ 
      message: 'Cleanup completed',
      deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up predictions:', error);
    res.status(500).json({ 
      message: 'Error cleaning up predictions',
      error: error.message 
    });
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Socket.IO enabled for real-time chat');
  console.log('AI services initialized');
});