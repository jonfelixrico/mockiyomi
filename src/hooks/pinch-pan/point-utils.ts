import { Point } from '@/types/point.interface'
import convexHull from 'convex-hull'

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

export function getAreaOfPoints(points: Point[]): number {
  // get convex hull points
  const chPoints = convexHull(points.map(({ x, y }) => [x, y])).map(
    ([x, y]) => {
      return { x, y }
    }
  )

  /*
   * Get area of points.
   * Formula taken from https://www.mathopenref.com/coordpolygonarea.html
   */
  let area = 0
  for (let i = 0; i < chPoints.length; i++) {
    const a = chPoints[i]
    const b = chPoints[(i + 1) % chPoints.length]
    area += a.x * b.y - a.y * b.x
  }
  return Math.abs(area / 2)
}
