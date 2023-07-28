import { Coords } from '@/types/coords.interface'
import { RefObject, useEffect, useState } from 'react'
import { usePointerTracker } from './use-pointer-tracker'

interface Origin {
  client: Coords
  target: Coords
}

export type PinchPanEvent = {
  origin: Coords
  location: Coords

  panDelta: Coords
  pinchDelta: number

  isFirst: boolean
  isFinal: boolean
}

function getCoordsRelativeToTarget(origin: Origin, e: PointerEvent): Coords {
  return {
    x: e.clientX - origin.client.x,
    y: e.clientY - origin.client.y,
  }
}

function getDelta(prev: Coords, now: Coords): Coords {
  return {
    x: now.x - prev.x,
    y: now.y - prev.y,
  }
}

export function usePinchPan(
  ref: RefObject<HTMLElement>,
  hookListener: (event: PinchPanEvent) => void
) {
  const refEl = ref.current

  const { pointerCount, removePointer, setPointer, originPointer } =
    usePointerTracker()

  const [origin, setOrigin] = useState<Origin | null>(null)

  const [lastEmitted, setLastEmitted] = useState<PinchPanEvent | null>(null)
  function emit(e: PinchPanEvent) {
    hookListener(e)
    setLastEmitted(e)
  }

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

        emit({
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

        // TODO remove
        console.log('started dragging')
      } else {
        // added more fingers to the touchscreen

        emit({
          isFirst: false,
          isFinal: false,

          /*
           * Logically, this cannot be origin.
           * We're pretty much doing a "just trust me bro" to the compiler.
           */
          origin: origin?.target as Coords,
          location: getCoordsRelativeToTarget(origin as Origin, originPointer),

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })
      }

      setPointer(e)
    }

    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  })

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl || !origin) {
        return
      }

      if (pointerCount === 1) {
        // all touches have been removed

        const currCoords = getCoordsRelativeToTarget(origin, e)

        emit({
          isFirst: false,
          isFinal: true,

          origin: origin.target,
          location: currCoords,

          panDelta: getDelta(lastEmitted?.location as Coords, currCoords),

          pinchDelta: 0,
        })

        // cleanup logic
        setOrigin(null)
        setLastEmitted(null)
        document.body.classList.remove('dragging')

        // TODO remove
        console.log('stopped dragging')
      } else {
        // pointer count > 1; can't be 0 at this point

        emit({
          isFirst: false,
          isFinal: false,

          origin: origin.target,
          location: origin.target, // TODO fix this

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })
      }

      removePointer(e)
    }

    window.addEventListener('pointerup', handler, { passive: true })
    return () => window.removeEventListener('pointerup', handler)
  })

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl || !origin) {
        return
      }

      const currCoords = getCoordsRelativeToTarget(origin, e)

      emit({
        isFirst: false,
        isFinal: false,

        origin: origin.target as Coords,
        location: currCoords,

        panDelta: getDelta(lastEmitted?.location as Coords, currCoords),

        pinchDelta: 0,
      })

      setPointer(e)
    }

    window.addEventListener('pointermove', handler, { passive: true })
    return () => window.removeEventListener('pointermove', handler)
  })
}
