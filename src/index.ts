import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { errorHandler } from './middleware/errors.js'
import { rateLimitMiddleware } from './middleware/ratelimit.js'
import { imgRoute } from './routes/img.js'
import { textRoute } from './routes/text.js'
import { fakeRoute } from './routes/fake.js'
import { mockRoute } from './routes/mock.js'
import { HAS_DATABASE, PORT, baseUrl } from './config.js'

const app = new OpenAPIHono()

app.onError(errorHandler)
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))
app.use('*', rateLimitMiddleware)

// Health check e indice. Antes `/` daba 404, asi que cualquier sonda externa
// (Railway, Docker, la UI) veia la API como caida estando perfectamente viva.
app.get('/', (c) => {
  const base = baseUrl(c.req.url)
  return c.json({
    name: 'DevKit API',
    status: 'ok',
    database: HAS_DATABASE ? 'configurada' : 'ausente — /mock no disponible',
    docs: `${base}/docs`,
    endpoints: {
      img:  `${base}/img/400x300`,
      text: `${base}/text?type=sentences&count=5`,
      fake: `${base}/fake/user?count=3`,
      mock: `${base}/mock/create`,
    },
  })
})

app.route('/img', imgRoute)
app.route('/text', textRoute)
app.route('/fake', fakeRoute)
app.route('/mock', mockRoute)

app.get('/docs', apiReference({
  spec: { url: '/openapi.json' },
  theme: 'deepSpace',
}))

app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'DevKit API',
    version: '1.0.0',
    description: 'Toolkit HTTP para desarrolladores full-stack',
  },
})

serve({ fetch: app.fetch, port: PORT, hostname: '0.0.0.0' }, () => {
  console.log(`DevKit API  ->  http://localhost:${PORT}`)
  console.log(`Docs        ->  http://localhost:${PORT}/docs`)
  if (!HAS_DATABASE) {
    console.warn('Sin DATABASE_URL: /img, /text y /fake funcionan; /mock no.')
  }
})
