import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { generateImage } from '../lib/image.js'

export const imgRoute = new OpenAPIHono()

const route = createRoute({
  method: 'get',
  path: '/{dims}',
  request: {
    params: z.object({
      dims: z.string().regex(/^\d+x\d+$/, 'Formato inválido, usa WxH (ej: 400x300)'),
    }),
    query: z.object({
      bg:     z.string().regex(/^[0-9a-fA-F]{6}$/).optional().default('cccccc'),
      text:   z.string().optional(),
      format: z.enum(['jpeg', 'png', 'webp']).optional().default('jpeg'),
    }),
  },
  responses: {
    200: { description: 'Imagen generada' },
    400: {
      description: 'Parámetros inválidos',
      content: { 'application/json': { schema: z.object({ error: z.string(), message: z.string() }) } },
    },
  },
})

imgRoute.openapi(route, async (c) => {
  const { dims } = c.req.valid('param')
  const { bg, text, format } = c.req.valid('query')

  const [w, h] = dims.split('x').map(Number)

  if (w > 5000 || h > 5000 || w < 1 || h < 1) {
    return c.json({
      error: 'invalid_dimensions',
      message: 'Width y height deben estar entre 1 y 5000',
      docs: 'http://localhost:4200/docs',
    }, 400)
  }

  const image = await generateImage({
    width: w,
    height: h,
    bg,
    text: text ?? `${w}x${h}`,
    format: format as 'jpeg' | 'png' | 'webp',
  })

  const uint8 = new Uint8Array(image)

  return new Response(uint8, {
  headers: {
    'Content-Type': `image/${format}`,
    'Cache-Control': 'public, max-age=86400',
  },
})
})