import { Point } from '@/types/point.interface'
import { useState } from 'react'

export interface Origin {
  client: Point
  target: Point
}

export interface PanSession {
  origin: Origin
  lastPoint: Point
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
      }
    })
  }

  return {
    panSession,
    setPanSession,
    setLastPoint,
  }
}
