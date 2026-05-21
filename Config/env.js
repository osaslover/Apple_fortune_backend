require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  JWT_SECRET: z.string().min(20).optional(),
  GAME_SECRET: z.string().min(20).optional(),

  // optional safety (if you want to lock CORS later)
  CORS_ORIGIN: z.string().default('*')
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables');
  console.error(env.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = env.data;
