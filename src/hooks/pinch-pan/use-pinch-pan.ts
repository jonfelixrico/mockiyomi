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
  origin: Point
  location: Point

  panDelta: Point
  pinch: PinchEvent | null

  isFirst: boolean
  isFinal: boolean
}

export interface PinchEvent {
  isFirst: boolean
  isFinal: boolean

  delta: number
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

// TODO handle three or more pointers
export function usePinchPan(
  ref: RefObject<HTMLElement>,
  hookListener: (event: PinchPanEvent) => void
) {
  const refEl = ref.current

  const { pointerCount, removePointer, setPointer, pointers } =
    usePointerTracker()

  const [origin, setOrigin] = useState<Origin | null>(null)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)
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

        const rect = refEl.getBoundingClientRect()
        const targetOrigin = {
          x: e.clientX - rect.x,
          y: e.clientY - rect.y,
        }
        setOrigin({
          target: targetOrigin,
          client: {
            x: rect.x,
            y: rect.y,
          },
        })

        hookListener({
          isFirst: true,
          isFinal: false,

          origin: targetOrigin,
          location: targetOrigin,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: null,
        })

        setLastPoint(targetOrigin)
        setDistanceData(null)
      } else {
        // added more fingers to the touchscreen

        hookListener({
          isFirst: false,
          isFinal: false,

          /*
           * Logically, this cannot be origin.
           * We're pretty much doing a "just trust me bro" to the compiler.
           */
          origin: origin?.target as Point,
          location: lastPoint as Point,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            delta: 0,
            isFirst: true,
            isFinal: false,
          },
        })

        const extractedPoints = getPointsFromPointers(
          [...pointers, e],
          origin as Origin
        )
        setLastPoint(getCentroid(extractedPoints))
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

          origin: origin.target,
          location: currCoords,

          panDelta: getDelta(lastPoint as Point, currCoords),

          pinch: null,
        })

        // cleanup logic
        setOrigin(null)
        setLastPoint(null)
        setDistanceData(null)
        document.body.classList.remove('dragging')
      } else {
        // only one finger will remain

        const extractedPoints = getPointsFromPointers(
          pointers.filter((p) => p.pointerId !== e.pointerId),
          origin
        )
        const currCoords = getCentroid(extractedPoints)

        hookListener({
          isFirst: false,
          isFinal: false,

          origin: origin.target,
          location: currCoords,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            delta: 0,
            isFinal: true,
            isFirst: false,
          },
        })

        setLastPoint(currCoords)
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
      const distance = getDistance(extractedPoints)

      if (pointerCount === 1) {
        hookListener({
          isFirst: false,
          isFinal: false,

          origin: origin.target as Point,
          location: currCoords,

          panDelta: getDelta(lastPoint as Point, currCoords),

          pinch: null,
        })
      } else {
        hookListener({
          isFirst: false,
          isFinal: false,

          origin: origin.target as Point,
          location: currCoords,

          panDelta: getDelta(lastPoint as Point, currCoords),

          pinch: {
            isFinal: false,
            isFirst: false,
            delta: distance / (distanceData as number),
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
