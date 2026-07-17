require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateConfig } = require('./config');
const { authenticateToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const plannerRoutes = require('./routes/planner');
const mentorRoutes = require('./routes/mentor');
const { quizRouter, submitHandler } = require('./routes/quiz');
const analyzerRoutes = require('./routes/analyzer');
const dashboardRoutes = require('./routes/dashboard');
const orchestratorRoutes = require('./routes/orchestrator');
const resourcesRoutes = require('./routes/resources');

// Validate critical configurations
validateConfig();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:5173"
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked origin:", origin);

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Authentication routes
app.use('/auth', authRoutes);

// Mount protected routes
app.use('/planner', plannerRoutes);
app.use('/mentor', mentorRoutes);
app.use('/quiz', quizRouter);
app.post('/submit', authenticateToken, submitHandler);
app.use('/analysis', analyzerRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/orchestrate', orchestratorRoutes);
app.use('/resources', resourcesRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
