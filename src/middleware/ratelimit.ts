import { rateLimiter } from 'hono-rate-limiter'
import { getConnInfo } from '@hono/node-server/conninfo'
import type { Context } from 'hono'
import { docsUrl, TRUST_PROXY } from '../config.js'

/**
 * Identifica al cliente para el contador de rate limit.
 *
 * x-forwarded-for lo controla quien llama, asi que solo se mira cuando la API
 * corre detras de un proxy de confianza (TRUST_PROXY=true). En cualquier otro
 * caso se usa la direccion real del socket: antes se caia a la cadena literal
 * 'unknown', con lo que en local TODOS los clientes compartian un unico cubo de
 * 60 req/min, y en produccion bastaba mandar un x-forwarded-for cualquiera para
 * saltarse el limite.
 */
function clientKey(c: Context): string {
  if (TRUST_PROXY) {
    const forwarded = c.req.header('x-forwarded-for')
    if (forwarded) return forwarded.split(',')[0]!.trim()
    const real = c.req.header('x-real-ip')
    if (real) return real.trim()
  }
  return getConnInfo(c).remote.address ?? 'local'
}

export const rateLimitMiddleware = rateLimiter({
  windowMs: 60 * 1000,
  limit: Number(process.env.RATE_LIMIT) || 60,
  standardHeaders: 'draft-6',
  keyGenerator: clientKey,
  handler: (c) => c.json({
    error: 'rate_limit_exceeded',
    message: 'Demasiadas requests. Intenta de nuevo en un minuto.',
    docs: docsUrl(c.req.url),
  }, 429),
})
