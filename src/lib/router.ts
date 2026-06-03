type Endpoint = {
  id: string
  path: string
  method: string
  status: number
  response: unknown
  delay: number
  headers: unknown
}

function pathToRegex(path: string): RegExp {
  const escaped = path
    .replace(/\//g, '\\/')
    .replace(/:([^/]+)/g, '([^/]+)')
  return new RegExp(`^${escaped}$`)
}

export function matchEndpoint(
  endpoints: Endpoint[],
  incomingPath: string,
  method: string
): Endpoint | null {
  for (const endpoint of endpoints) {
    if (endpoint.method !== method) continue
    const regex = pathToRegex(endpoint.path)
    if (regex.test(incomingPath)) return endpoint
  }
  return null
}