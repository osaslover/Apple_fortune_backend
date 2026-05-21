// config/env.js
require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Secrets (optional for now, required if you later add JWT auth)
  JWT_SECRET: z.string().min(20).optional(),
  GAME_SECRET: z.string().min(20).optional(),

  // CORS
  // Use "*" to allow all origins, which is best for your HTML file hosted anywhere.
  CORS_ORIGIN: z.string().default('*')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = parsed.data;
