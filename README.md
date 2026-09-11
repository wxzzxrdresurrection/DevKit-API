# DevKit API

Toolkit HTTP para desarrolladores full-stack. Genera imágenes placeholder, texto Lorem, datos ficticios y mock APIs REST — todo desde una URL, sin autenticación ni setup.

**UI:** [devkit-ui](https://github.com/wxzzxrdresurrection/devkit-ui) · **Docs:** `/docs` en tu instancia (ej. http://localhost:3200/docs)

---

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Hono + @hono/zod-openapi
- **Base de datos:** PostgreSQL + Prisma 7
- **Documentación:** OpenAPI 3.0 + Scalar UI
- **Deploy:** Railway

---

## Herramientas

### `GET /img/:dims` — Imagen placeholder

Genera imágenes on-the-fly con las dimensiones exactas que necesites.

```bash
# Imagen básica
curl http://localhost:3200/img/400x300

# Con color y texto personalizados
curl http://localhost:3200/img/800x400?bg=1E3A5F&text=Banner

# En formato webp
curl http://localhost:3200/img/400x300?format=webp
```

| Parámetro | Tipo  | Descripción                             | Default    |
| ---------- | ----- | ---------------------------------------- | ---------- |
| `dims`   | path  | Dimensiones en formato `WxH` (1–5000) | requerido  |
| `bg`     | query | Color de fondo en hex                    | `cccccc` |
| `text`   | query | Texto superpuesto                        | `WxH`    |
| `format` | query | `jpeg` \| `png` \| `webp`          | `jpeg`   |

---

### `GET /text` — Generador de texto

Lorem ipsum en el formato y cantidad que necesites.

```bash
# 5 oraciones en JSON
curl "http://localhost:3200/text?type=sentences&count=5&format=json"

# 10 palabras en plain text
curl "http://localhost:3200/text?type=words&count=10"

# 2 párrafos en HTML
curl "http://localhost:3200/text?type=paragraphs&count=2&format=html"
```

| Parámetro | Tipo  | Descripción                                 | Default       |
| ---------- | ----- | -------------------------------------------- | ------------- |
| `type`   | query | `words` \| `sentences` \| `paragraphs` | `sentences` |
| `count`  | query | Cantidad a generar (1–100)                  | `5`         |
| `format` | query | `plain` \| `json` \| `html`            | `plain`     |

---

### `GET /fake/:schema` — Datos ficticios

Genera objetos JSON coherentes por schema usando `@faker-js/faker`.

```bash
# 3 usuarios en español
curl "http://localhost:3200/fake/user?count=3&locale=es"

# 5 productos con seed reproducible
curl "http://localhost:3200/fake/product?count=5&seed=42"
```

**Schemas disponibles:** `user` · `product` · `post` · `company`

| Parámetro | Tipo  | Descripción                          | Default   |
| ---------- | ----- | ------------------------------------- | --------- |
| `schema` | path  | Schema a generar                      | requerido |
| `count`  | query | Cantidad (1–100)                     | `1`     |
| `locale` | query | `en` \| `es`                      | `en`    |
| `seed`   | query | Semilla para resultados reproducibles | —        |

---

### Mock API REST

Registra endpoints personalizados y consúmelos como una API real. Sin autenticación — cada proyecto recibe un UUID único.

```bash
# 1. Crear proyecto
curl -X POST http://localhost:3200/mock/create
# → { "projectId": "a3f9b2c1-..." }

# 2. Registrar endpoint
curl -X POST http://localhost:3200/mock/{projectId}/register \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/users",
    "method": "GET",
    "status": 200,
    "response": { "users": [{ "id": 1, "name": "Luis" }] },
    "delay": 500
  }'

# 3. Consumir endpoint
curl http://localhost:3200/mock/{projectId}/users
# → { "users": [{ "id": 1, "name": "John Doe" }] }

# 4. Listar endpoints del proyecto
curl http://localhost:3200/mock/{projectId}/endpoints

# 5. Eliminar proyecto
curl -X DELETE http://localhost:3200/mock/{projectId}
```

| Endpoint                            | Método | Descripción          |
| ----------------------------------- | ------- | --------------------- |
| `/mock/create`                    | POST    | Crea un proyecto mock |
| `/mock/:id/register`              | POST    | Registra un endpoint  |
| `/mock/:id/endpoints`             | GET     | Lista los endpoints   |
| `/mock/:id/endpoints/:endpointId` | DELETE  | Elimina un endpoint   |
| `/mock/:id`                       | DELETE  | Elimina el proyecto   |
| `/mock/:id/*`                     | ANY     | Consume los endpoints |

---

## Diseño de errores

Todos los endpoints retornan errores en el mismo formato:

```json
{
  "error": "invalid_dimensions",
  "message": "Width must be between 1 and 5000",
  "docs": "http://localhost:3200/docs"
}
```

| HTTP | `error`               | Cuándo ocurre                       |
| ---- | ----------------------- | ------------------------------------ |
| 400  | `invalid_params`      | Parámetros fuera de rango           |
| 404  | `project_not_found`   | El projectId no existe               |
| 404  | `endpoint_not_found`  | El endpoint no existe en el proyecto |
| 429  | `rate_limit_exceeded` | Más de 60 requests por minuto       |
| 500  | `internal_error`      | Error inesperado del servidor        |

---

## Correr en local

### Con Docker (recomendado)

Levanta la API y su PostgreSQL ya cableados entre si. No necesitas Postgres
instalado:

```bash
git clone https://github.com/wxzzxrdresurrection/devkit-api.git
cd devkit-api
docker compose up
```

API en `http://localhost:3200` · docs en `http://localhost:3200/docs`.

### Sin Docker

`/img`, `/text` y `/fake` **no necesitan base de datos** — solo la herramienta de
mock la usa. Si no te interesan los mocks, puedes saltarte Postgres entero:

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

La API arranca y avisa por consola de que `/mock` no esta disponible.

Para tener tambien los mocks, necesitas un PostgreSQL accesible:

```bash
cp .env.example .env          # ajusta DATABASE_URL
pnpm prisma migrate deploy
pnpm dev
```

---

## UI

[devkit-ui](https://github.com/wxzzxrdresurrection/devkit-ui) es el playground web.
Apunta a `http://localhost:3200` por defecto, asi que con la API corriendo
funciona sin configurar nada.

---

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a PostgreSQL. Solo la usa la herramienta de mock | — |
| `PORT` | Puerto del servidor | `3200` |
| `TRUST_PROXY` | `true` solo detrás de un proxy de confianza (Railway, nginx). Decide si se hace caso a `x-forwarded-for` para el rate limit | `false` |
| `RATE_LIMIT` | Requests por minuto y por IP | `60` |
