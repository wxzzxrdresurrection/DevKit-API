import fs from 'node:fs'
import path from 'node:path'
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

function getFontBase64(): string {
  const fontPath = path.resolve(
    'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2'
  )
  try {
    const font = fs.readFileSync(fontPath)
    return font.toString('base64')
  } catch {
    return ''
  }
}

const fontBase64 = getFontBase64()

export async function generateImage(opts: ImageOptions): Promise<Buffer> {
  const { width, height, bg, text, format } = opts
  const textColor = getTextColor(bg)
  const fontSize = Math.max(12, Math.min(Math.floor(width / text.length * 1.2), 48))

  const fontFace = fontBase64
    ? `<defs>
        <style>
          @font-face {
            font-family: 'Inter';
            src: url('data:font/woff2;base64,${fontBase64}');
          }
        </style>
      </defs>`
    : ''

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${fontFace}
      <rect width="100%" height="100%" fill="#${bg}"/>
      <text
        x="50%" y="50%"
        font-family="${fontBase64 ? 'Inter' : 'sans-serif'}"
        font-size="${fontSize}"
        fill="#${textColor}"
        text-anchor="middle"
        dominant-baseline="middle"
      >${text}</text>
    </svg>
  `

  return sharp(Buffer.from(svg))
    .toFormat(format)
    .toBuffer()
}