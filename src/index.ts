import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { serve } from '@hono/node-server'
import { errorHandler } from './middleware/errors.js'
import { imgRoute } from './routes/img.js'
import { textRoute } from './routes/text.js'
import { fakeRoute } from './routes/fake.js'
import { mockRoute } from './routes/mock.js'
import { rateLimitMiddleware } from './middleware/ratelimit.js'
import { cors } from 'hono/cors'

const app = new OpenAPIHono()
const PORT = 4200

app.onError(errorHandler)
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))
app.use('*', rateLimitMiddleware)

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

serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3200,
    hostname: '0.0.0.0' },
    () => { console.log(`DevKit API corriendo`) }
  )