// @ts-ignore
import sharp from 'sharp'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import path from 'path'
import fs from 'fs'
interface ImageOptions {
  width: number
  height: number
  bg: string
  text: string
  format: 'jpeg' | 'png' | 'webp'
}

const fontPath = path.resolve(import.meta.dirname, '../assets/SpaceMono-Bold.ttf')
GlobalFonts.registerFromPath(fontPath, 'CustomMonospace')
console.log("¿La fuente existe en el disco?:", fs.existsSync(fontPath));

function hexToRgb(hex: string) {
  const n = parseInt(hex, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function getTextColor(bg: string) {
  const { r, g, b } = hexToRgb(bg)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#333333' : '#eeeeee'
}

export async function generateImage(opts: ImageOptions): Promise<Buffer> {
  const { width, height, bg, text, format } = opts

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = `#${bg}`
  ctx.fillRect(0, 0, width, height)

  const displayText = text && text.trim() !== ''
    ? text
    : 'Your text here'

  const fontSize = Math.max(12, Math.min(Math.floor((width / displayText.length) * 1.4), 48))

  ctx.fillStyle = getTextColor(bg)
  ctx.font = `${fontSize}px "Space Mono"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(displayText, width / 2, height / 2)

  // Convertir a buffer con Sharp
  const pngBuffer = canvas.toBuffer('image/png')

  return sharp(pngBuffer)
    .toFormat(format)
    .toBuffer()
  }