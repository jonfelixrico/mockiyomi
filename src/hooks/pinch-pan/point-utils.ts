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
  // Formula is from https://byjus.com/maths/distance-between-two-points-formula

  const dx = Math.pow(b.x - a.x, 2)
  const dy = Math.pow(b.y - a.y, 2)

  return Math.sqrt(dx + dy)
}

export function getAreaOfPoints(points: Point[]): number {
  // Part 1: get convex hull points

  const formattedPoints = points.map(({ x, y }) => [x, y] as [number, number])

  const chPoints = convexHull(formattedPoints).map(([segmentStartIndex]) => {
    /*
     * A misconception about the convexHull library is that it outputs an array of xy values.
     * It does not. It outputs an array of segments (e.g. [[pointA, pointB], [pointB, pointC],
     * [pointC, pointA]]).
     *
     * Instead of each segment point being an actual point, it's instead just a number that points
     * to the index in the input of convexHull. To get the actual point, you simply just need to call
     * inputArrayForConvexHull[indexOfAPointInTheSegmentArray]
     *
     * Reference: https://github.com/mikolalysenko/convex-hull/issues/1#issuecomment-390495950
     */
    return points[segmentStartIndex]
  })

  /*
   * Part2: get area of points
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
