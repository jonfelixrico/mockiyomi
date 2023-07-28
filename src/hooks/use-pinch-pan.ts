import { Coords } from '@/types/coords.interface'
import { RefObject, useEffect, useState } from 'react'

export type PinchPanEvent = {
  origin: Coords

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

  const [origin, setOrigin] = useState<Coords | null>(null)

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl) {
        return
      }

      if (getPointerCount() === 0) {
        document.body.classList.add('dragging')

        const rect = refEl.getBoundingClientRect()
        const origin = {
          x: e.clientX - rect.x,
          y: e.clientY - rect.y,
        }
        setOrigin(origin)

        hookListener({
          isFirst: true,
          isFinal: false,

          origin,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })

        // TODO remove
        console.log('started dragging')
      } else {
        hookListener({
          isFirst: false,
          isFinal: false,

          /*
           * Logically, this cannot be origin.
           * We're pretty much doing a "just trust me bro" to the compiler.
           */
          origin: origin as Coords,

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

        hookListener({
          isFirst: false,
          isFinal: true,

          origin: origin as Coords,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })

        // cleanup logic
        setOrigin(null)
        document.body.classList.remove('dragging')

        // TODO remove
        console.log('stopped dragging')
      } else {
        // pointer count > 1; can't be 0 at this point

        hookListener({
          isFirst: false,
          isFinal: false,

          origin: origin as Coords,

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
      if (!refEl) {
        return
      }

      hookListener({
        isFirst: false,
        isFinal: false,

        origin: origin as Coords,

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
