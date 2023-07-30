import { Point } from '@/types/point.interface'
import { RefObject, useEffect } from 'react'
import { usePointerTracker } from './use-pointer-tracker'
import {
  getAreaOfPoints,
  getCentroid,
  getDistanceOfTwoPoints,
} from './point-utils'
import { Origin, usePanSession } from './use-pan-session'
import { usePinchSession } from './use-pinch-session'

export interface PinchPanEvent {
  panDelta: Point
  pinch: PinchEvent | null

  isFirst: boolean
  isFinal: boolean
}

export interface PinchEvent {
  isFirst: boolean
  isFinal: boolean

  scale: number
  location: Point
}

function getDistance(points: Point[]): number {
  if (points.length === 2) {
    return getDistanceOfTwoPoints(points[0], points[1])
  } else if (points.length > 2) {
    return getAreaOfPoints(points)
  }

  return 0
}

interface Options {
  className?: string
}

export function usePinchPan(
  ref: RefObject<HTMLElement>,
  hookListener: (event: PinchPanEvent) => void,
  options?: Options
) {
  const refEl = ref.current

  const { pointerCount, removePointer, setPointer, pointers } =
    usePointerTracker()

  const {
    panSession,
    setPanSession,
    setLastPoint,
    extractPoint,
    extractPoints,
    getDelta,
  } = usePanSession()
  const { pinchSession, setPinchSession, setLastDistance, getScale } =
    usePinchSession()

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

        setPinchSession(null)
      } else if (panSession && pointerCount === 1) {
        /*
         * There will be two pointers at the screen
         */

        const extractedPoints = extractPoints([...pointers, e])
        const pinchCenterPoint = getCentroid(extractedPoints)

        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            scale: 1, // we're starting of with a scale of 1 because we've just started
            isFirst: false,
            isFinal: false,
            location: pinchCenterPoint,
          },
        })

        setLastPoint(pinchCenterPoint)

        const distance = getDistance(extractedPoints)
        setPinchSession({
          lastDistance: distance,
          referenceDistance: distance,
          multiplier: 1,
        })
      } else if (panSession && pinchSession && pointerCount >= 2) {
        /*
         * There will be more than two pointers at the screen
         */

        const extractedPoints = extractPoints([...pointers, e])
        const pinchLoc = getCentroid(extractedPoints)

        const previousScale = getScale(pinchSession.lastDistance)

        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            scale: previousScale,
            isFirst: false,
            isFinal: false,
            location: pinchLoc,
          },
        })

        setLastPoint(pinchLoc)
        const distance = getDistance(extractedPoints)
        setPinchSession((session) => {
          if (!session) {
            throw new Error('unexpected null session')
          }

          return {
            lastDistance: distance,
            referenceDistance: distance,
            multiplier: previousScale,
          }
        })
      }

      setPointer(e)
    }

    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  })

  // pointer up
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl || !panSession) {
        return
      }

      if (pointerCount === 1) {
        /*
         * One finger was left before the pointer up, so that means no fingers now
         * remain in the surface.
         */

        const currCoords = extractPoint(e)
        hookListener({
          isFirst: false,
          isFinal: true,

          panDelta: getDelta(currCoords),

          pinch: null,
        })

        // cleanup logic
        setPanSession(null)
        setPinchSession(null)

        document.body.classList.remove('dragging')
        if (options?.className) {
          document.body.classList.remove(options.className)
        }

        removePointer(e)
      } else if (pointerCount === 2 && pinchSession) {
        /*
         * Two fingers remain before the pointer up event.
         * After the pointer up event, that means only one finger remains in the
         * surface which means that we've exited the pinching mode.
         *
         * We're expecting that pinchSession will be available at this point since previously there
         * are two fingers.
         */

        const pinchLocation = getCentroid(extractPoints([...pointers, e]))

        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            scale: getScale(pinchSession.lastDistance),
            isFinal: true,
            isFirst: false,
            location: pinchLocation,
          },
        })

        const remainingPointerLoc = getCentroid(
          extractPoints(pointers.filter((p) => p.pointerId !== e.pointerId))
        )
        setLastPoint(remainingPointerLoc)

        setPinchSession(null)

        removePointer(e)
      } else if (pointerCount > 2 && pinchSession) {
        /*
         * There are three or more fingers before the pointer up event occurred.
         * We are still in pinch mode after the pointer up event since there will be at least
         * two fingers remaining on the screen.
         *
         *
         * Check the previous else-if block for the explanation of pinchSession.
         */

        const pointsFromPointers = extractPoints([...pointers, e])

        const pinchLocation = getCentroid(pointsFromPointers)
        const previousScale = getScale(pinchSession.lastDistance)

        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            scale: previousScale,
            isFinal: false,
            isFirst: false,
            location: pinchLocation,
          },
        })

        const fromRemaining = extractPoints(
          pointers.filter((p) => p.pointerId !== e.pointerId)
        )

        const remainingPointerLoc = getCentroid(fromRemaining)
        setLastPoint(remainingPointerLoc)

        const newDistance = getDistance(fromRemaining)
        setPinchSession((session) => {
          if (!session) {
            throw new Error('unexpected null session')
          }

          return {
            lastDistance: newDistance,
            referenceDistance: newDistance,
            multiplier: previousScale,
          }
        })

        removePointer(e)
      }
    }

    window.addEventListener('pointerup', handler, { passive: true })
    return () => window.removeEventListener('pointerup', handler)
  })

  // pointer move
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl || !panSession) {
        return
      }

      const extractedPoints = extractPoints([...pointers, e])
      const currCoords = getCentroid(extractedPoints)

      if (pointerCount === 1) {
        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: getDelta(currCoords),

          pinch: null,
        })
      } else if (pinchSession) {
        /*
         * Handling for 2 fingers and up.
         * If there are 2 or more fingers, pinchSession is expected to be present.
         */

        const distance = getDistance(extractedPoints)
        hookListener({
          isFirst: false,
          isFinal: false,

          panDelta: getDelta(currCoords),

          pinch: {
            isFinal: false,
            isFirst: false,
            scale: getScale(distance),
            location: currCoords,
          },
        })
        setLastDistance(distance)
      }

      setLastPoint(currCoords)
      setPointer(e)
    }

    window.addEventListener('pointermove', handler, { passive: true })
    return () => window.removeEventListener('pointermove', handler)
  })
}
