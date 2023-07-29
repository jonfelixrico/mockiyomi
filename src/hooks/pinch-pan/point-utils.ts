import { Point } from '@/types/point.interface'

export function getCentroid(coords: Point[]): Point {
  let sumX = 0
  let sumY = 0

  for (const { x, y } of coords) {
    sumX += x
    sumY += y
  }

  return {
    x: sumX / coords.length,
    y: sumY / coords.length,
  }
}

export function getDistanceOfTwoPoints(a: Point, b: Point): number {
  const dx = Math.pow(b.x - a.x, 2)
  const dy = Math.pow(b.y - a.y, 2)

  return Math.sqrt(dx + dy)
}
