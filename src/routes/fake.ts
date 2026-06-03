import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { generateFake } from '../lib/faker.js'

export const fakeRoute = new OpenAPIHono()

const schemas = ['user', 'product', 'post', 'company'] as const

const route = createRoute({
  method: 'get',
  path: '/{schema}',
  request: {
    params: z.object({
      schema: z.enum(schemas),
    }),
    query: z.object({
      count:  z.coerce.number().min(1).max(100).optional().default(1),
      locale: z.enum(['en', 'es']).optional().default('en'),
      seed:   z.coerce.number().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Datos ficticios generados',
      content: { 'application/json': { schema: z.object({ schema: z.string(), count: z.number(), data: z.array(z.any()) }) } },
    },
    400: {
      description: 'Schema inválido',
      content: { 'application/json': { schema: z.object({ error: z.string(), message: z.string() }) } },
    },
  },
})

fakeRoute.openapi(route, (c: any) => {
  const { schema } = c.req.valid('param')
  const { count, locale, seed } = c.req.valid('query')

  const data = generateFake(schema, count, locale, seed)

  return c.json({ schema, count, data })
})