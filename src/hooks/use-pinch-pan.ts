import { Coords } from '@/types/coords.interface'
import { RefObject, useEffect, useState } from 'react'

export type PinchPanEvent = {
  location: Coords

  panDelta: Coords
  pinchDelta: number

  isFirst: boolean
  isFinal: boolean
}

export function usePinchZoom(
  ref: RefObject<HTMLElement>,
  hookListener: (event: PinchPanEvent) => void
) {
  const refEl = ref.current

  const [pointers, setPointers] = useState<Record<string, PointerEvent>>({})

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl) {
        return
      }

      if (Object.keys(pointers).length === 0) {
        document.body.classList.add('dragging')
      }

      setPointers((pointers) => {
        return {
          ...pointers,
          [e.pointerId]: e,
        }
      })

      hookListener({
        isFirst: true,
        isFinal: false,

        location: {
          // TODO fix dummy data
          x: 0,
          y: 0,
        },

        panDelta: {
          x: 0,
          y: 0,
        },

        pinchDelta: 0,
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

      if (Object.keys(pointers).length === 1) {
        // all touches have been removed

        document.body.classList.remove('dragging')
      } else {
        // TODO do impl
      }

      setPointers((pointers) => {
        const clone = { ...pointers }
        delete clone[e.pointerId]

        return clone
      })

      hookListener({
        isFirst: false,
        isFinal: true,

        location: {
          // TODO fix dummy data
          x: 0,
          y: 0,
        },

        panDelta: {
          x: 0,
          y: 0,
        },

        pinchDelta: 0,
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

        location: {
          // TODO fix dummy data
          x: 0,
          y: 0,
        },

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
