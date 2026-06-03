import type { Context } from 'hono'

export function errorHandler(err: Error, c: Context) {
  console.error(err)
  return c.json({
    error: 'internal_error',
    message: err.message ?? 'Error inesperado del servidor',
    docs: 'http://localhost:3000/docs',
  }, 500)
}