import { Point } from '@/types/point.interface'
import { RefObject, useEffect, useState } from 'react'
import { usePointerTracker } from './use-pointer-tracker'

interface Origin {
  client: Point
  target: Point
}

export type PinchPanEvent = {
  origin: Point
  location: Point

  panDelta: Point
  pinchDelta: number

  isFirst: boolean
  isFinal: boolean
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

function getCentroid(coords: Point[]): Point {
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

function getDistanceViaDistanceFormula(a: Point, b: Point): number {
  const dx = Math.pow(b.x - a.x, 2)
  const dy = Math.pow(b.y - a.y, 2)

  return Math.sqrt(dx + dy)
}

function getDistance(points: Point[]): number {
  if (points.length <= 1) {
    return 0
  } else if (points.length === 2) {
    return getDistanceViaDistanceFormula(points[0], points[1])
  } else {
    // TODO impl convex hull
    return 0
  }
}

function preparePointers(pointers: PointerEvent[], origin: Origin): Point[] {
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

export function usePinchPan(
  ref: RefObject<HTMLElement>,
  hookListener: (event: PinchPanEvent) => void
) {
  const refEl = ref.current

  const { pointerCount, removePointer, setPointer, pointers } =
    usePointerTracker()

  const [origin, setOrigin] = useState<Origin | null>(null)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)
  const [lastDistance, setLastDistance] = useState(0)

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

          pinchDelta: 0,
        })

        setLastPoint(targetOrigin)
        setLastDistance(0)
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

          pinchDelta: 0,
        })

        const uniquePointers = preparePointers(
          [...pointers, e],
          origin as Origin
        )
        setLastPoint(getCentroid(uniquePointers))
        setLastDistance(
          getDistanceViaDistanceFormula(uniquePointers[0], uniquePointers[1])
        )
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
        // all touches have been removed

        const currCoords = getPointRelativeToTarget(origin, e)

        hookListener({
          isFirst: false,
          isFinal: true,

          origin: origin.target,
          location: currCoords,

          panDelta: getDelta(lastPoint as Point, currCoords),

          pinchDelta: 0,
        })

        // cleanup logic
        setOrigin(null)
        setLastPoint(null)
        document.body.classList.remove('dragging')
      } else {
        // assume that at this point, we only have 1 pointer left

        const remainingPointer = preparePointers(
          pointers.filter((p) => p.pointerId !== e.pointerId),
          origin
        )[0]

        hookListener({
          isFirst: false,
          isFinal: false,

          origin: origin.target,
          location: remainingPointer,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })

        setLastPoint(remainingPointer)
        setLastDistance(0)
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

      const uniquePointers = preparePointers([...pointers, e], origin)
      const currCoords = getCentroid(uniquePointers)

      const distance =
        pointerCount === 1
          ? 0
          : getDistanceViaDistanceFormula(uniquePointers[0], uniquePointers[1])

      hookListener({
        isFirst: false,
        isFinal: false,

        origin: origin.target as Point,
        location: currCoords,

        panDelta: getDelta(lastPoint as Point, currCoords),

        pinchDelta: pointerCount === 1 ? 0 : distance / lastDistance,
      })

      setLastPoint(currCoords)
      setPointer(e)

      if (pointerCount > 1) {
        setLastDistance(distance)
      }
    }

    window.addEventListener('pointermove', handler, { passive: true })
    return () => window.removeEventListener('pointermove', handler)
  })
}
