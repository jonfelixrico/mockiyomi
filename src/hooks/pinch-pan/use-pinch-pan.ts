import { Point } from '@/types/point.interface'
import { RefObject, useEffect, useState } from 'react'
import { usePointerTracker } from './use-pointer-tracker'
import {
  getAreaOfPoints,
  getCentroid,
  getDistanceOfTwoPoints,
} from './point-utils'

interface Origin {
  client: Point
  target: Point
}

export interface PinchPanEvent {
  panDelta: Point
  pinch: PinchEvent | null

  isFirst: boolean
  isFinal: boolean
}

export interface PinchEvent {
  isFirst: boolean
  isFinal: boolean

  delta: number
  location: Point
}

interface PanSession {
  origin: Origin
  lastPoint: Point
}

function getPointRelativeToTarget({ client }: Origin, e: PointerEvent): Point {
  return {
    x: e.clientX - client.x,
    y: e.clientY - client.y,
  }
}

function getDelta(prev: Point, now: Point): Point {
  return {
    x: now.x - prev.x,
    y: now.y - prev.y,
  }
}

function getDistance(points: Point[]): number {
  if (points.length <= 1) {
    return 0
  } else if (points.length === 2) {
    return getDistanceOfTwoPoints(points[0], points[1])
  } else {
    return getAreaOfPoints(points)
  }
}

function getPointsFromPointers(
  pointers: PointerEvent[],
  origin: Origin
): Point[] {
  const uniquesMap: Record<string, PointerEvent> = {}

  for (const evt of pointers) {
    /*
     * We're using the concept of maps to do something like a unique-by-latest
     * operation. Lower-index same-id entries will be overridden by
     * higher-index ones.
     */
    uniquesMap[evt.pointerId] = evt
  }

  return Object.values(uniquesMap).map((pointer) =>
    getPointRelativeToTarget(origin, pointer)
  )
}

interface Options {
  className?: string
}

// TODO handle three or more pointers
export function usePinchPan(
  ref: RefObject<HTMLElement>,
  hookListener: (event: PinchPanEvent) => void,
  options?: Options
) {
  const refEl = ref.current

  const { pointerCount, removePointer, setPointer, pointers } =
    usePointerTracker()

  const [panSession, setPanSession] = useState<PanSession | null>(null)
  const origin = panSession?.origin
  const lastPoint = panSession?.lastPoint
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

  const [distanceData, setDistanceData] = useState<number | null>(null)

  // pointer down
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl) {
        return
      }

      if (pointerCount === 0) {
        // Needed to prevent causing highlights once the interaction has started
        e.preventDefault()

        document.body.classList.add('dragging')
        if (options?.className) {
          document.body.classList.add(options.className)
        }

        const rect = refEl.getBoundingClientRect()
        const targetOrigin = {
          x: e.clientX - rect.x,
          y: e.clientY - rect.y,
        }

        setPanSession({
          origin: {
            target: targetOrigin,
            client: {
              x: rect.x,
              y: rect.y,
            },
          },
          lastPoint: targetOrigin,
        })

        hookListener({
          isFirst: true,
          isFinal: false,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: null,
        })

        setDistanceData(null)
      } else {
        // added more fingers to the touchscreen

        const extractedPoints = getPointsFromPointers(
          [...pointers, e],
          origin as Origin
        )
        const pinchLoc = getCentroid(extractedPoints)

        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            delta: 1,
            isFirst: true,
            isFinal: false,
            location: pinchLoc,
          },
        })

        setLastPoint(pinchLoc)
        setDistanceData(getDistance(extractedPoints))
      }

      setPointer(e)
    }

    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  })

  // pointer up
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl || !origin) {
        return
      }

      if (pointerCount === 1) {
        // the last finger will be removed

        const currCoords = getPointRelativeToTarget(origin, e)

        hookListener({
          isFirst: false,
          isFinal: true,

          panDelta: getDelta(lastPoint as Point, currCoords),

          pinch: null,
        })

        // cleanup logic
        setPanSession(null)
        setDistanceData(null)
        document.body.classList.remove('dragging')
        if (options?.className) {
          document.body.classList.remove(options.className)
        }
      } else {
        // only one finger will remain

        const pinchLoc = getCentroid(
          getPointsFromPointers([...pointers, e], origin)
        )
        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            delta: 1, // TODO use delta of previous
            isFinal: true,
            isFirst: false,
            location: pinchLoc,
          },
        })

        const remainingPointerLoc = getCentroid(
          getPointsFromPointers(
            pointers.filter((p) => p.pointerId !== e.pointerId),
            origin
          )
        )
        setLastPoint(remainingPointerLoc)

        setDistanceData(null)
      }

      removePointer(e)
    }

    window.addEventListener('pointerup', handler, { passive: true })
    return () => window.removeEventListener('pointerup', handler)
  })

  // pointer move
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl || !origin) {
        return
      }

      const extractedPoints = getPointsFromPointers([...pointers, e], origin)
      const currCoords = getCentroid(extractedPoints)

      if (pointerCount === 1) {
        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: getDelta(lastPoint as Point, currCoords),

          pinch: null,
        })
      } else {
        const distance = getDistance(extractedPoints)
        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: getDelta(lastPoint as Point, currCoords),

          pinch: {
            isFinal: false,
            isFirst: false,
            delta: distance / (distanceData as number),
            location: currCoords,
          },
        })
      }

      setLastPoint(currCoords)
      setPointer(e)
    }

    window.addEventListener('pointermove', handler, { passive: true })
    return () => window.removeEventListener('pointermove', handler)
  })
}
