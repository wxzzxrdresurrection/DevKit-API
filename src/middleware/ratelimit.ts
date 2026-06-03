import { rateLimiter } from 'hono-rate-limiter'

export const rateLimitMiddleware = rateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  limit: 60,           // 60 requests por minuto por IP
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    return c.req.header('x-forwarded-for') ??
           c.req.header('x-real-ip') ??
           'unknown'
  },
  handler: (c) => {
    return c.json({
      error: 'rate_limit_exceeded',
      message: 'Demasiadas requests. Intenta de nuevo en un minuto.',
      docs: 'http://localhost:3000/docs',
    }, 429)
  }
})