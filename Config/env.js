// config/env.js
require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Optional secrets; if omitted, no validation error.
  JWT_SECRET: z.string().optional(),
  GAME_SECRET: z.string().optional(),

  // Allow all origins by default.
  CORS_ORIGIN: z.string().default('*'),

  // Optional database URL.
  DATABASE_URL: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = parsed.data;
