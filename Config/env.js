// config/env.js
// Simple environment loader that will NOT crash your Render deployment.

require('dotenv').config();

module.exports = {
  PORT: Number(process.env.PORT) || 3000,

  NODE_ENV: process.env.NODE_ENV || 'development',

  // Optional secrets
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'change_this_to_a_long_random_secret_1234567890',

  GAME_SECRET:
    process.env.GAME_SECRET ||
    'change_this_to_another_long_random_secret_1234567890',

  // Allow all origins by default
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Optional database URL
  DATABASE_URL: process.env.DATABASE_URL || ''
};
