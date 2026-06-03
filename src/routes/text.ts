import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { generateText } from '../lib/text.js'

export const textRoute = new OpenAPIHono()

const route = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: z.object({
      type:   z.enum(['words', 'sentences', 'paragraphs']).optional().default('sentences'),
      count:  z.coerce.number().min(1).max(100).optional().default(5),
      format: z.enum(['plain', 'json', 'html']).optional().default('plain'),
    }),
  },
  responses: {
    200: { description: 'Texto generado' },
    400: {
      description: 'Parámetros inválidos',
      content: { 'application/json': { schema: z.object({ error: z.string(), message: z.string() }) } },
    },
  },
})

textRoute.openapi(route, async (c) => {
  const { type, count, format } = c.req.valid('query')
  const result = generateText(type, count)

  if (format === 'json') {
    return c.json({ type, count, data: result })
  }

  if (format === 'html') {
    const html = result.map((t: string) => `<p>${t}</p>`).join('\n')
    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  }

  return new Response(result.join('\n\n'), {
    headers: { 'Content-Type': 'text/plain' },
  })
})