const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('./logger');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('Could not connect to MongoDB', err));

// Define a user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true }
});

// Create a user model
const User = mongoose.model('User', userSchema);

// Complex Query: Find users above a certain age
app.get('/users/above-age/:age', async (req, res) => {
  try {
    const age = parseInt(req.params.age);
    const users = await User.find({ age: { $gt: age } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Aggregation Pipeline: Group users by age and count
app.get('/users/group-by-age', async (req, res) => {
  try {
    const users = await User.aggregate([
      { $group: { _id: '$age', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Aggregation Pipeline: Average age of users
app.get('/users/average-age', async (req, res) => {
  try {
    const result = await User.aggregate([
      { $group: { _id: null, averageAge: { $avg: '$age' } } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Optimizing Database Queries
userSchema.index({ email: 1 });

// Error-handling middleware (place at the end)
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}/`);
});
