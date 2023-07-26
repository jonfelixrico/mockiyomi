'use client'

import { RefObject, useEffect, useState } from 'react'

export type PinchZoomEvent = {
  delta: number
}

function getDistance(e: TouchEvent) {
  const a = e.touches.item(0)
  const b = e.touches.item(1)

  const xPart = Math.pow((a?.clientX ?? 0) - (b?.clientX ?? 0), 2)
  const yPart = Math.pow((a?.clientY ?? 0) - (b?.clientY ?? 0), 2)

  return Math.abs(Math.sqrt(xPart + yPart))
}

export function usePinchZoom(
  ref: RefObject<HTMLElement>,
  hookHandler: (event: PinchZoomEvent) => void
) {
  const refEl = ref.current

  const [lastDistance, setLastDistance] = useState<number | null>(null)

  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (!refEl) {
        return
      }

      if (e.touches.length === 2 && lastDistance !== null) {
        const prev = lastDistance
        const curr = getDistance(e)

        setLastDistance(curr)

        hookHandler({
          /*
           * If positive, then zooming out
           * If negative, then zooming in
           * Else, no change
           */
          delta: curr - prev,
        })
      } else if (e.touches.length === 2) {
        setLastDistance(getDistance(e))
      } else {
        setLastDistance(null)
      }
    }

    window.addEventListener('touchmove', handler, { passive: true })
    return () => window.removeEventListener('touchmove', handler)
  })

  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (!refEl) {
        return
      }

      setLastDistance(null)
    }

    window.addEventListener('touchend', handler, { passive: true })
    return () => window.removeEventListener('touchend', handler)
  })
}
