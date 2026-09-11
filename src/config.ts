import 'dotenv/config'

/**
 * Puerto del servidor. Railway inyecta PORT; en local vale 3200.
 * Este es el unico sitio donde se decide: el README y la UI apuntan aqui.
 */
export const PORT = Number(process.env.PORT) || 3200

/** Si la API corre detras de un proxy de confianza (Railway, nginx). */
export const TRUST_PROXY = process.env.TRUST_PROXY === 'true'

/** true si hay base de datos configurada. Sin ella solo cae /mock. */
export const HAS_DATABASE = Boolean(process.env.DATABASE_URL)

/**
 * URL publica de la API derivada de la propia peticion.
 *
 * Antes estaba hardcodeada como http://localhost:3000 en varios sitios, asi que
 * produccion servia enlaces a la maquina de quien llamaba. Derivarla del request
 * funciona igual en local, en Docker y en Railway sin configurar nada.
 */
export function baseUrl(requestUrl: string): string {
  return new URL(requestUrl).origin
}

export function docsUrl(requestUrl: string): string {
  return `${baseUrl(requestUrl)}/docs`
}
