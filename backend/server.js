require('dotenv').config();
const express = require('express');
const cors = require('cors');

const plannerRoutes = require('./routes/planner');
const mentorRoutes = require('./routes/mentor');
const quizRoutes = require('./routes/quiz');
const analyzerRoutes = require('./routes/analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Mount routes
app.use('/planner', plannerRoutes);
app.use('/mentor', mentorRoutes);
app.use('/quiz', quizRoutes);
app.use('/analyzer', analyzerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
