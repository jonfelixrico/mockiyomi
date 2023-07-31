import { Point } from '@/types/point.interface'
import { RefObject, useEffect, useState } from 'react'
import { usePointerTracker } from './use-pointer-tracker'
import {
  getAreaOfPoints,
  getCentroid,
  getDistanceOfTwoPoints,
} from './point-utils'
import { usePanSession } from './use-pan-session'
import { usePinchSession } from './use-pinch-session'

export interface PinchPanEvent {
  panDelta: Point
  pinch: PinchEvent | null

  isFirst: boolean
  isFinal: boolean

  count: number
}

export interface PinchEvent {
  isFirst: boolean
  isFinal: boolean

  scale: number
  location: Point
}

function getPinchArea(points: Point[]): number {
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

  const [count, setCount] = useState(1)
  function emit(
    event: Omit<PinchPanEvent, 'count' | 'isFirst' | 'isFinal'>,
    order?: 'first' | 'final'
  ) {
    hookListener({
      ...event,

      isFirst: order === 'first',
      isFinal: order === 'final',
      count,
    })
  }

  // pointer down
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl) {
        return
      }

      if (pointerCount === 0) {
        /*
         * This block means that the user has placed a finger on the screen.
         * This is the entrypoint for the entire thing.
         *
         * At this point, panning is activated but not pinching.
         * The latter requires at least two fingers on the screen.
         */

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

        emit(
          {
            panDelta: {
              x: 0,
              y: 0,
            },

            pinch: null,
          },
          'first'
        )

        setPinchSession(null)
      } else if (panSession && pointerCount === 1) {
        /*
         * Here, the user has added a second finger of the screen.
         * This is the entrypoint of the pinching behavior.
         */

        const points = extractPoints([...pointers, e])
        const pinchCenterPoint = getCentroid(points)

        emit({
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

        const area = getPinchArea(points)
        setPinchSession({
          lastArea: area,
          referenceArea: area,
          scaleMultiplier: 1,
        })
      } else if (panSession && pinchSession && pointerCount >= 2) {
        /*
         * This simply continues the pinching behavior by adding more fingers.
         */

        const points = extractPoints([...pointers, e])
        const pinchCenterPoint = getCentroid(points)

        const previousScale = getScale(pinchSession.lastArea)

        emit({
          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            scale: previousScale,
            isFirst: false,
            isFinal: false,
            location: pinchCenterPoint,
          },
        })

        setLastPoint(pinchCenterPoint)

        const area = getPinchArea(points)
        setPinchSession((session) => {
          if (!session) {
            throw new Error('unexpected null session')
          }

          return {
            lastArea: area,
            referenceArea: area,
            scaleMultiplier: previousScale,
          }
        })
      }

      setPointer(e)
      setCount((count) => count + 1)
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

        const currentPoint = extractPoint(e)
        emit(
          {
            panDelta: getDelta(currentPoint),

            pinch: null,
          },
          'final'
        )

        // cleanup logic
        setPanSession(null)
        setPinchSession(null)

        document.body.classList.remove('dragging')
        if (options?.className) {
          document.body.classList.remove(options.className)
        }

        setCount(1) // reset for the next session
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

        emit({
          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            scale: getScale(pinchSession.lastArea),
            isFinal: true,
            isFirst: false,
            location: pinchLocation,
          },
        })

        const remainingPoint = getCentroid(
          extractPoints(pointers.filter((p) => p.pointerId !== e.pointerId))
        )
        setLastPoint(remainingPoint)

        setPinchSession(null)
        setCount((count) => count + 1)
      } else if (pointerCount > 2 && pinchSession) {
        /*
         * There are three or more fingers before the pointer up event occurred.
         * We are still in pinch mode after the pointer up event since there will be at least
         * two fingers remaining on the screen.
         *
         *
         * Check the previous else-if block for the explanation of pinchSession.
         */

        const pointsIncludingLifted = extractPoints([...pointers, e])

        const pinchCenterPoint = getCentroid(pointsIncludingLifted)
        const previousScale = getScale(pinchSession.lastArea)

        emit({
          panDelta: {
            x: 0,
            y: 0,
          },

          pinch: {
            scale: previousScale,
            isFinal: false,
            isFirst: false,
            location: pinchCenterPoint,
          },
        })

        const remainingPoints = extractPoints(
          pointers.filter((p) => p.pointerId !== e.pointerId)
        )

        const remainingPinchCenterPoint = getCentroid(remainingPoints)
        setLastPoint(remainingPinchCenterPoint)

        const remainingPinchArea = getPinchArea(remainingPoints)
        setPinchSession((session) => {
          if (!session) {
            throw new Error('unexpected null session')
          }

          return {
            lastArea: remainingPinchArea,
            referenceArea: remainingPinchArea,
            scaleMultiplier: previousScale,
          }
        })

        setCount((count) => count + 1)
      }

      removePointer(e)
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

      const points = extractPoints([...pointers, e])
      const centerPoint = getCentroid(points)

      if (pointerCount === 1) {
        emit({
          panDelta: getDelta(centerPoint),

          pinch: null,
        })
      } else if (pinchSession) {
        /*
         * Handling for 2 fingers and up.
         * If there are 2 or more fingers, pinchSession is expected to be present.
         */

        const area = getPinchArea(points)
        emit({
          panDelta: getDelta(centerPoint),

          pinch: {
            isFinal: false,
            isFirst: false,
            scale: getScale(area),
            location: centerPoint,
          },
        })
        setLastDistance(area)
      }

      setLastPoint(centerPoint)
      setPointer(e)
      setCount((count) => count + 1)
    }

    window.addEventListener('pointermove', handler, { passive: true })
    return () => window.removeEventListener('pointermove', handler)
  })
}