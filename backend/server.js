require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const plannerRoutes = require('./routes/planner');
const mentorRoutes = require('./routes/mentor');
const { quizRouter, submitHandler } = require('./routes/quiz');
const analyzerRoutes = require('./routes/analyzer');
const dashboardRoutes = require('./routes/dashboard');
const orchestratorRoutes = require('./routes/orchestrator');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
