'use client'

import { RefObject, useEffect, useState } from 'react'
import { PanEvent } from './pan-types'
import { Coords } from '@/types/coords.interface'

function getLocationRelativeToRect(e: Touch, rect: DOMRect | null): Coords {
  if (!rect) {
    return {
      x: 0,
      y: 0,
    }
  }

  return {
    x: e.clientX - rect.x,
    y: e.clientY - rect.y,
  }
}

function getDelta(past: Coords, current: Coords): Coords {
  return {
    x: current.x - past.x,
    y: current.y - past.y,
  }
}

function getTouch(e: TouchEvent) {
  const touch = e.touches.item(0)
  if (!touch) {
    throw new Error('test')
  }

  return touch
}

export function useTouchPan(
  ref: RefObject<HTMLElement>,
  hookHandler: (event: PanEvent) => void
) {
  const [lastEvt, setLastEvt] = useState<PanEvent | null>(null)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const refEl = ref.current

  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (!refEl) {
        return
      }

      document.body.classList.add('dragging')
      e.preventDefault()

      const originRect = refEl.getBoundingClientRect()
      setOriginRect(originRect)

      const touch = getTouch(e)
      const panEvt = {
        isFinal: false,
        isFirst: true,
        location: getLocationRelativeToRect(touch, originRect),
        delta: {
          x: 0,
          y: 0,
        },
      }

      hookHandler(panEvt)
      setLastEvt(panEvt)
    }

    refEl?.addEventListener('touchstart', handler)
    return () => refEl?.removeEventListener('touchstart', handler)
  })

  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (!refEl || lastEvt === null) {
        return
      }

      const touch = getTouch(e)
      const location = getLocationRelativeToRect(touch, originRect)

      const panEvt = {
        isFinal: false,
        isFirst: false,
        location,
        delta: getDelta(lastEvt.location, location),
      }

      hookHandler(panEvt)
      setLastEvt(panEvt)
    }

    window.addEventListener('touchmove', handler)
    return () => window.removeEventListener('touchmove', handler)
  })

  useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (!refEl || lastEvt === null || e.touches.length > 0) {
        return
      }

      hookHandler({
        ...lastEvt,
        isFinal: true,
        isFirst: false,
        delta: {
          x: 0,
          y: 0,
        },
      })
      setLastEvt(null)
      setOriginRect(null)

      document.body.classList.remove('dragging')
    }

    window.addEventListener('touchend', handler)
    window.addEventListener('touchcancel', handler)
    return () => {
      window.removeEventListener('touchend', handler)
      window.removeEventListener('touchcancel', handler)
    }
  })
}
