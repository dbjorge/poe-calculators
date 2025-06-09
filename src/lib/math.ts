export type Vector = { x: number, y: number }
export type Point = Vector

export function randomVector(magnitude: number): Vector {
  const angle = Math.random() * Math.PI * 2
  return {
    x: Math.sin(angle) * magnitude,
    y: Math.cos(angle) * magnitude
  }
}

export function magnitude(v: Vector) {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

export function add(a: Point, b: Vector): Point {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function clamp(min: number, max: number, value: number) {
  return Math.min(Math.max(value, min), max)
}

export function lerp(a: number, b: number, progress: number) {
  return clamp(
    Math.min(a, b),
    Math.max(a, b),
    a + (b - a) * progress)
}

export function distSqr(a: Point, b: Point) {
  return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
}
