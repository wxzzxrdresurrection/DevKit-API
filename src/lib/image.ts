// @ts-ignore
import sharp from 'sharp'

interface ImageOptions {
  width: number
  height: number
  bg: string
  text: string
  format: 'jpeg' | 'png' | 'webp'
}

function hexToRgb(hex: string) {
  const n = parseInt(hex, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function getTextColor(bg: string) {
  const { r, g, b } = hexToRgb(bg)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '333333' : 'eeeeee'
}

export async function generateImage(opts: ImageOptions): Promise<Buffer> {
  const { width, height, bg, text, format } = opts
  const { r, g, b } = hexToRgb(bg)
  const textColor = getTextColor(bg)
  const fontSize = Math.max(12, Math.min(Math.floor(width / text.length * 1.2), 48))

  // Imagen base con color sólido
  const base = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r, g, b },
    }
  })

  // SVG solo con el texto — sin rect ni fondo
  const textSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="50%"
        y="50%"
        font-family="monospace"
        font-size="${fontSize}"
        fill="#${textColor}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-weight="bold"
      >${text}</text>
    </svg>
  `)

  return base
    .composite([{ input: textSvg, top: 0, left: 0 }])
    .toFormat(format)
    .toBuffer()
}