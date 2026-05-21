require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,

  NODE_ENV:
    process.env.NODE_ENV || 'development',

  DATABASE_URL:
    process.env.DATABASE_URL || '',

  JWT_SECRET:
    process.env.JWT_SECRET ||
    'default_jwt_secret_123456789',

  GAME_SECRET:
    process.env.GAME_SECRET ||
    'default_game_secret_123456789',

  CORS_ORIGIN:
    process.env.CORS_ORIGIN || '*'
};
