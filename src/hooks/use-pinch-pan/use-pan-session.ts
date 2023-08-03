import { Point } from '@/types/point.interface'
import { useState } from 'react'

export interface Origin {
  client: Point
  target: Point
}

export interface PanSession {
  origin: Origin
  startTimestamp: number
  lastPoint: Point
  lastTimestamp: number
}

export function usePanSession() {
  const [panSession, setPanSession] = useState<PanSession | null>(null)

  function setLastPoint(point: Point) {
    setPanSession((session) => {
      if (!session) {
        return null
      }

      return {
        ...session,
        lastPoint: point,
        lastTimestamp: Date.now(),
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

    const { lastPoint } = panSession
    return {
      x: point.x - lastPoint.x,
      y: point.y - lastPoint.y,
    }
  }

  function getDeltaAndVelocity(point: Point) {
    if (!panSession) {
      throw new Error('no pan session')
    }

    const intervalSeconds = (Date.now() - panSession.lastTimestamp) / 1000
    const delta = getDelta(point)

    return {
      panDelta: delta,
      velocity: {
        x: delta.x / intervalSeconds,
        y: delta.y / intervalSeconds,
      },
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
