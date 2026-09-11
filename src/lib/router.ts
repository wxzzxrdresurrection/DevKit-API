type Endpoint = {
  id: string
  path: string
  method: string
  status: number
  response: unknown
  delay: number
  headers: unknown
}

/** Un segmento dinamico: `:id`, `:userId`. Nada mas cuenta como parametro. */
const PARAM_SEGMENT = /^:[A-Za-z_][A-Za-z0-9_]*$/

/** Neutraliza cualquier metacaracter de regex dentro de un literal. */
function escapeRegex(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Compila el path registrado por el usuario a una regex.
 *
 * El path llega de la peticion, asi que NO puede interpolarse en crudo: cada
 * segmento se escapa entero y solo los `:param` se convierten en grupo de
 * captura. Antes se interpolaba tal cual, y un path como `/(a+)+$` bastaba
 * para colgar el proceso entero con backtracking catastrofico.
 */
function pathToRegex(path: string): RegExp {
  const pattern = path
    .split('/')
    .map((segment) => (PARAM_SEGMENT.test(segment) ? '([^/]+)' : escapeRegex(segment)))
    .join('/')
  return new RegExp(`^${pattern}$`)
}

/** Las regex compiladas se reutilizan entre peticiones. */
const regexCache = new Map<string, RegExp>()

function getRegex(path: string): RegExp {
  let regex = regexCache.get(path)
  if (!regex) {
    regex = pathToRegex(path)
    regexCache.set(path, regex)
  }
  return regex
}

export function matchEndpoint(
  endpoints: Endpoint[],
  incomingPath: string,
  method: string
): Endpoint | null {
  for (const endpoint of endpoints) {
    if (endpoint.method !== method) continue
    if (getRegex(endpoint.path).test(incomingPath)) return endpoint
  }
  return null
}

/** Expuesto solo para las pruebas. */
export const __test = { pathToRegex, escapeRegex }
