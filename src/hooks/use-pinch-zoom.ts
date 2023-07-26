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

      document.body.classList.add('dragging')
    }

    refEl?.addEventListener('touchstart', handler)
    return () => refEl?.removeEventListener('touchstart', handler)
  })

  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (!refEl) {
        return
      }

      if (e.touches.length === 2 && lastDistance !== null) {
        const prev = lastDistance
        const curr = getDistance(e)

        setLastDistance(curr)

        if (prev > curr) {
          hookHandler({
            delta: 1,
          })
        } else if (prev < curr) {
          hookHandler({
            delta: -1,
          })
        } else {
          hookHandler({
            delta: 0,
          })
        }
      } else if (e.touches.length === 2) {
        setLastDistance(getDistance(e))
      } else {
        setLastDistance(null)
      }
    }

    window.addEventListener('touchmove', handler)
    return () => window.removeEventListener('touchmove', handler)
  })

  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (!refEl) {
        return
      }

      setLastDistance(null)

      document.body.classList.remove('dragging')
    }

    window.addEventListener('touchend', handler)
    return () => window.removeEventListener('touchend', handler)
  })
}
