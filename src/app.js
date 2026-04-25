const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./routes');
const corsMiddleware = require('./middlewares/cors');
const loggerMiddleware = require('./middlewares/logger');

dotenv.config();

const {
  PORT = 3005,
  API_URL = 'http://127.0.0.1',
  MONGO_URL = 'mongodb://127.0.0.1:27017/librarydb',
} = process.env;

const app = express();

// Middlewares
app.use(loggerMiddleware);
app.use(corsMiddleware);
// Built-in middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/', routes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on ${API_URL}:${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });

