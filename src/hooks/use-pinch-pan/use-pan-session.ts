import { Point } from '@/types/point.interface'
import { useState } from 'react'
import { getDeltaOfPoints } from './point-utils'

export interface Origin {
  client: Point
  target: Point
}

export interface PanSession {
  origin: Origin

  startTimestamp: number

  lastPoint: Point
  lastTimestamp: number
  lastVelocity: Point
}

function computeVelocityWithMovingAverage(
  delta: Point,
  elapsed: number,
  oldVelocity: Point
) {
  const instVelocity = {
    x: (1000 * delta.x) / (1 + elapsed),
    y: (1000 * delta.y) / (1 + elapsed),
  }

  return {
    x: 0.8 * instVelocity.x + 0.2 * oldVelocity.x,
    y: 0.8 * instVelocity.y + 0.2 * oldVelocity.y,
  }
}

export function usePanSession() {
  const [panSession, setPanSession] = useState<PanSession | null>(null)

  function setLastPoint(point: Point) {
    setPanSession((session) => {
      if (!session) {
        return null
      }

      const now = Date.now()
      return {
        ...session,
        lastPoint: point,
        lastTimestamp: now,
        lastVelocity: computeVelocityWithMovingAverage(
          getDeltaOfPoints(point, session.lastPoint),
          session.startTimestamp - now,
          session.lastVelocity
        ),
      }
    })
  }

  function extractPoint(e: PointerEvent): Point {
    if (!panSession) {
      throw new Error('no pan session')
    }

    const { client } = panSession.origin
    return {
      x: e.clientX - client.x,
      y: e.clientY - client.y,
    }
  }

  function extractPoints(pointers: PointerEvent[]) {
    const uniquesMap: Record<string, PointerEvent> = {}

    for (const evt of pointers) {
      /*
       * We're using the concept of maps to do something like a unique-by-latest
       * operation. Lower-index same-id entries will be overridden by
       * higher-index ones.
       */
      uniquesMap[evt.pointerId] = evt
    }

    return Object.values(uniquesMap).map(extractPoint)
  }

  function getDelta(point: Point) {
    if (!panSession) {
      throw new Error('no pan session')
    }

    return getDeltaOfPoints(point, panSession.lastPoint)
  }

  function getDeltaAndVelocity(point: Point) {
    if (!panSession) {
      throw new Error('no pan session')
    }

    const elapsed = Date.now() - panSession.lastTimestamp
    const delta = getDelta(point)

    return {
      panDelta: delta,
      velocity: computeVelocityWithMovingAverage(
        delta,
        elapsed,
        panSession.lastVelocity
      ),
    }
  }

  return {
    panSession,
    setPanSession,
    setLastPoint,
    extractPoint,
    extractPoints,
    getDelta,
    getDeltaAndVelocity,
  }
}
