import { Coords } from '@/types/coords.interface'
import { RefObject, useEffect, useState } from 'react'

export type PinchPanEvent = {
  location: Coords

  panDelta: Coords
  pinchDelta: number

  isFinal: boolean
}

export function usePinchZoom(
  ref: RefObject<HTMLElement>,
  hookHandler: (event: PinchPanEvent) => void
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
    }

    window.addEventListener('pointerup', handler, { passive: true })
    return () => window.removeEventListener('pointerup', handler)
  })

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl) {
        return
      }
    }

    window.addEventListener('pointermove', handler, { passive: true })
    return () => window.removeEventListener('pointermove', handler)
  })
}
