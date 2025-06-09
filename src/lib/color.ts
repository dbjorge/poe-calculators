import { clamp, lerp } from "./math"

export type Color = { r: number, g: number, b: number }

export function lerpColor(start: Color, end: Color, progress: number) {
  return {
    r: lerp(start.r, end.r, progress),
    g: lerp(start.g, end.g, progress),
    b: lerp(start.b, end.b, progress),
  }
}

export function colorToStr(c: Color): string {
  const hexR = Math.round(clamp(0, 1, c.r) * 0xFF).toString(16).padStart(2, '0')
  const hexG = Math.round(clamp(0, 1, c.g) * 0xFF).toString(16).padStart(2, '0')
  const hexB = Math.round(clamp(0, 1, c.b) * 0xFF).toString(16).padStart(2, '0')
  const out = `#${hexR}${hexG}${hexB}`
  return out
}

export function strToColor(s: string): Color {
  if (/^#([a-fA-F0-9]){3}$/.test(s)) {
    return {
      r: clamp(0, 1, parseInt(s.substring(1, 2), 16) / 0xF),
      g: clamp(0, 1, parseInt(s.substring(2, 3), 16) / 0xF),
      b: clamp(0, 1, parseInt(s.substring(3, 4), 16) / 0xF)
    }
  } else if (/^#([a-fA-F0-9]){6}$/.test(s)) {
    return {
      r: clamp(0, 1, parseInt(s.substring(1, 3), 16) / 0xFF),
      g: clamp(0, 1, parseInt(s.substring(3, 5), 16) / 0xFF),
      b: clamp(0, 1, parseInt(s.substring(5, 7), 16) / 0xFF)
    }
  } else {
    throw new Error(`Invalid color string ${s}`)
  }
}