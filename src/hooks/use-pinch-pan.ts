import { Coords } from '@/types/coords.interface'
import { RefObject, useEffect, useState } from 'react'

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

export function usePinchPan(
  ref: RefObject<HTMLElement>,
  hookListener: (event: PinchPanEvent) => void
) {
  const refEl = ref.current

  const [pointers, setPointers] = useState<Record<string, PointerEvent>>({})
  function getPointerCount() {
    return Object.keys(pointers).length
  }

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

      if (getPointerCount() === 0) {
        document.body.classList.add('dragging')

        const rect = refEl.getBoundingClientRect()
        const targetOrigin = {
          x: e.clientX - rect.x,
          y: e.clientY - rect.y,
        }
        setOrigin({
          target: targetOrigin,
          client: {
            x: e.clientX,
            y: e.clientY,
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
        emit({
          isFirst: false,
          isFinal: false,

          /*
           * Logically, this cannot be origin.
           * We're pretty much doing a "just trust me bro" to the compiler.
           */
          origin: origin?.target as Coords,
          location: origin?.target as Coords, // TODO fix this

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })
      }

      setPointers((pointers) => {
        return {
          ...pointers,
          [e.pointerId]: e,
        }
      })
    }

    window.addEventListener('pointerdown', handler, { passive: true })
    return () => window.removeEventListener('pointerdown', handler)
  })

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl) {
        return
      }

      if (getPointerCount() === 1) {
        // all touches have been removed

        emit({
          isFirst: false,
          isFinal: true,

          origin: origin?.target as Coords,
          location: origin?.target as Coords, // TODO fix this

          panDelta: {
            x: 0,
            y: 0,
          },

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

          origin: origin?.target as Coords,
          location: origin?.target as Coords, // TODO fix this

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })
      }

      setPointers((pointers) => {
        const clone = { ...pointers }
        delete clone[e.pointerId]

        return clone
      })
    }

    window.addEventListener('pointerup', handler, { passive: true })
    return () => window.removeEventListener('pointerup', handler)
  })

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl || !origin) {
        return
      }

      const currentCoords = {
        x: e.clientX - origin.client.x,
        y: e.clientY - origin.client.y,
      }

      emit({
        isFirst: false,
        isFinal: false,

        origin: origin.target as Coords,
        location: currentCoords,

        panDelta: {
          x: 0,
          y: 0,
        },

        pinchDelta: 0,
      })
    }

    window.addEventListener('pointermove', handler, { passive: true })
    return () => window.removeEventListener('pointermove', handler)
  })
}
