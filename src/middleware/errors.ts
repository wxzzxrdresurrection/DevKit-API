import type { Context } from 'hono'
import { docsUrl } from '../config.js'

export function errorHandler(err: Error, c: Context) {
  console.error(err)
  return c.json({
    error: 'internal_error',
    message: 'Error inesperado del servidor',
    docs: docsUrl(c.req.url),
  }, 500)
}
