import { faker, fakerES, fakerEN } from '@faker-js/faker'

type Schema = 'user' | 'product' | 'post' | 'company'
type Locale = 'en' | 'es'

function getFaker(locale: Locale) {
  return locale === 'es' ? fakerES : fakerEN
}

function generateUser(f: typeof faker, base: string) {
  return {
    id:        f.string.uuid(),
    name:      f.person.fullName(),
    email:     f.internet.email(),
    phone:     f.phone.number(),
    avatar:    `${base}/img/80x80?bg=${f.color.rgb().replace('#', '')}&text=avatar`,
    address:   f.location.streetAddress(true),
    birthdate: f.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
  }
}

function generateProduct(f: typeof faker, base: string) {
  return {
    id:          f.string.uuid(),
    name:        f.commerce.productName(),
    description: f.commerce.productDescription(),
    price:       parseFloat(f.commerce.price({ min: 1, max: 999 })),
    category:    f.commerce.department(),
    image:       `${base}/img/400x300?bg=${f.color.rgb().replace('#', '')}&text=product`,
    stock:       f.number.int({ min: 0, max: 500 }),
  }
}

function generatePost(f: typeof faker, _base: string) {
  return {
    id:        f.string.uuid(),
    title:     f.lorem.sentence(),
    body:      f.lorem.paragraphs(2),
    author:    f.person.fullName(),
    tags:      f.helpers.arrayElements(['tech', 'design', 'dev', 'news', 'tutorial', 'opinion'], { min: 1, max: 3 }),
    createdAt: f.date.recent({ days: 30 }).toISOString(),
    likes:     f.number.int({ min: 0, max: 1000 }),
  }
}

function generateCompany(f: typeof faker, _base: string) {
  return {
    id:        f.string.uuid(),
    name:      f.company.name(),
    industry:  f.company.buzzNoun(),
    email:     f.internet.email(),
    website:   f.internet.url(),
    address:   f.location.streetAddress(true),
    employees: f.number.int({ min: 5, max: 10000 }),
  }
}

/**
 * @param base Origen de la API (ej. http://localhost:3200). Las URLs de avatar
 *   e imagen se construyen sobre el, no sobre un host fijo.
 */
export function generateFake(
  schema: Schema,
  count: number,
  locale: Locale,
  base: string,
  seed?: number,
): object[] {
  const f = getFaker(locale)

  // Las instancias de faker son singletons de modulo: sin reseed, una peticion
  // sin `seed` seguiria la secuencia que dejo la anterior peticion sembrada.
  f.seed(seed !== undefined ? seed : Math.floor(Math.random() * 2 ** 48))

  const generators: Record<Schema, (f: typeof faker, base: string) => object> = {
    user:    generateUser,
    product: generateProduct,
    post:    generatePost,
    company: generateCompany,
  }

  return Array.from({ length: count }, () => generators[schema](f, base))
}