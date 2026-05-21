// config/env.js
require('dotenv').config();

module.exports = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  GAME_SECRET: process.env.GAME_SECRET || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
