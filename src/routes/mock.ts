import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { prisma } from '../db/client.js'
import { matchEndpoint } from '../lib/router.js'

export const mockRoute = new OpenAPIHono()

// ── Crear proyecto ────────────────────────────────────────────────────────────
const createProjectRoute = createRoute({
  method: 'post',
  path: '/create',
  responses: {
    201: {
      description: 'Proyecto creado',
      content: { 'application/json': { schema: z.object({ projectId: z.string() }) } },
    },
  },
})

mockRoute.openapi(createProjectRoute, async (c) => {
  const project = await prisma.mockProject.create({ data: {} })
  return c.json({ projectId: project.id }, 201)
})

// ── Registrar endpoint ────────────────────────────────────────────────────────
const registerEndpointRoute = createRoute({
  method: 'post',
  path: '/:projectId/register',
  request: {
    params: z.object({
      projectId: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            path:     z.string().startsWith('/'),
            method:   z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
            status:   z.number().min(100).max(599).default(200),
            response: z.record(z.any(), z.any()).default({}),
            delay:    z.number().min(0).max(10000).default(0),
            headers:  z.record(z.string(), z.string()).default({}),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Endpoint registrado',
      content: { 'application/json': { schema: z.object({ endpointId: z.string() }) } },
    },
    404: {
      description: 'Proyecto no encontrado',
      content: { 'application/json': { schema: z.object({ error: z.string(), message: z.string() }) } },
    },
  },
})

mockRoute.openapi(registerEndpointRoute, async (c: any) => {
  console.log('Registrar endpoint')
  const body = c.req.valid('json')

  console.log("URL Solicitada:", c.req.url);
  console.log("Parametro capturado:", c.req.param('projectId'));
  const { projectId } = c.req.valid('param' as any)

  const project = await prisma.mockProject.findUnique({ where: { id: projectId } })

  if (!project) {
    return c.json({ error: 'project_not_found', message: `Proyecto ${projectId} no existe` }, 404)
  }

  const endpoint = await prisma.mockEndpoint.create({
    data: {
      projectId,
      path:     body.path,
      method:   body.method,
      status:   body.status,
      response: body.response,
      delay:    body.delay,
      headers:  body.headers,
    },
  })

  return c.json({ endpointId: endpoint.id }, 201)
})

// ── Listar endpoints ──────────────────────────────────────────────────────────
const listEndpointsRoute = createRoute({
  method: 'get',
  path: '/:projectId/endpoints',
  request: {
    params: z.object({ projectId: z.string().openapi({
      param: { name: 'projectId', in: 'path' },
      example: '123e4567-e89b-12d3-a456-426614174000',
    }) }),
  },
  responses: {
    200: {
      description: 'Lista de endpoints del proyecto',
      content: { 'application/json': { schema: z.object({ projectId: z.string(), endpoints: z.array(z.any()) }) } },
    },
    404: {
      description: 'Proyecto no encontrado',
      content: { 'application/json': { schema: z.object({ error: z.string(), message: z.string() }) } },
    },
  },
})

mockRoute.openapi(listEndpointsRoute, async (c: any) => {
  const { projectId } = c.req.valid('param')

  const project = await prisma.mockProject.findUnique({
    where: { id: projectId },
    include: { endpoints: true },
  })

  if (!project) {
    return c.json({ error: 'project_not_found', message: `Proyecto ${projectId} no existe` }, 404)
  }

  return c.json({ projectId, endpoints: project.endpoints })
})

// ── Eliminar endpoint ─────────────────────────────────────────────────────────
const deleteEndpointRoute = createRoute({
  method: 'delete',
  path: '/:projectId/endpoints/:endpointId',
  request: {
    params: z.object({ projectId: z.string(), endpointId: z.string() }),
  },
  responses: {
    200: {
      description: 'Endpoint eliminado',
      content: { 'application/json': { schema: z.object({ deleted: z.boolean() }) } },
    },
    404: {
      description: 'Endpoint no encontrado',
      content: { 'application/json': { schema: z.object({ error: z.string(), message: z.string() }) } },
    },
  },
})

mockRoute.openapi(deleteEndpointRoute, async (c: any) => {
  const { projectId, endpointId } = c.req.valid('param')

  const endpoint = await prisma.mockEndpoint.findFirst({
    where: { id: endpointId, projectId },
  })

  if (!endpoint) {
    return c.json({ error: 'endpoint_not_found', message: `Endpoint ${endpointId} no existe` }, 404)
  }

  await prisma.mockEndpoint.delete({ where: { id: endpointId } })
  return c.json({ deleted: true })
})

// ── Eliminar proyecto ─────────────────────────────────────────────────────────
const deleteProjectRoute = createRoute({
  method: 'delete',
  path: '/:projectId',
  request: {
    params: z.object({ projectId: z.string() }),
  },
  responses: {
    200: {
      description: 'Proyecto eliminado',
      content: { 'application/json': { schema: z.object({ deleted: z.boolean() }) } },
    },
    404: {
      description: 'Proyecto no encontrado',
      content: { 'application/json': { schema: z.object({ error: z.string(), message: z.string() }) } },
    },
  },
})

mockRoute.openapi(deleteProjectRoute, async (c: any) => {
  const { projectId } = c.req.valid('param')

  const project = await prisma.mockProject.findUnique({ where: { id: projectId } })

  if (!project) {
    return c.json({ error: 'project_not_found', message: `Proyecto ${projectId} no existe` }, 404)
  }

  await prisma.mockProject.delete({ where: { id: projectId } })
  return c.json({ deleted: true })
})

// ── Router dinámico ───────────────────────────────────────────────────────────
mockRoute.all('/:projectId/*', async (c) => {
  const projectId = c.req.param('projectId')
  const incomingPath = '/' + c.req.path.split(`/mock/${projectId}/`)[1]
  const method = c.req.method

  const endpoints = await prisma.mockEndpoint.findMany({
    where: { projectId },
  })

  if (endpoints.length === 0) {
    return c.json({ error: 'project_not_found', message: `Proyecto ${projectId} no existe o no tiene endpoints` }, 404)
  }

  const matched = matchEndpoint(endpoints, incomingPath, method)

  if (!matched) {
    return c.json({ error: 'endpoint_not_found', message: `No hay endpoint ${method} ${incomingPath} en este proyecto` }, 404)
  }

  if (matched.delay > 0) {
    await new Promise(resolve => setTimeout(resolve, matched.delay))
  }

  const headers = new Headers({ 'Content-Type': 'application/json' })
  const customHeaders = matched.headers as Record<string, string>
  Object.entries(customHeaders).forEach(([k, v]) => headers.set(k, v))

  return new Response(JSON.stringify(matched.response), {
    status: matched.status,
    headers,
  })
})