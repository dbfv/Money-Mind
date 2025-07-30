const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./api/users/user.routes');
const sourceRoutes = require('./api/sources/source.routes');
const transactionRoutes = require('./api/transactions/transaction.routes');
const economicAssumptionRoutes = require('./api/economicAssumptions/economicAssumption.routes');
const sixJarsProfileRoutes = require('./api/sixJarsProfiles/sixJarsProfile.routes');
const categoryRoutes = require('./api/categories/category.routes');
const calendarEventRoutes = require('./api/calendarEvents/calendarEvent.routes');

const app = express();
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});