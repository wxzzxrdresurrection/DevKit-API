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
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  }
}

function getTextColor(bg: string) {
  const { r, g, b } = hexToRgb(bg)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '333333' : 'eeeeee'
}

export async function generateImage(opts: ImageOptions): Promise<Buffer> {
  const { width, height, bg, text, format } = opts
  const textColor = getTextColor(bg)
  const fontSize = Math.max(12, Math.min(Math.floor(width / text.length * 1.2), 48))

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bg}"/>
      <text
        x="50%" y="50%"
        font-family="sans-serif"
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