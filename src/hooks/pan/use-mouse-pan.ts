'use client'

import { RefObject, useEffect, useState } from 'react'
import { PanEvent } from './pan-types'
import { Coords } from '@/types/coords.interface'

function getLocationRelativeToRect(
  e: MouseEvent,
  rect: DOMRect | null
): Coords {
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

export function useMousePan(
  ref: RefObject<HTMLElement>,
  hookHandler: (event: PanEvent) => void
) {
  const [lastEvt, setLastEvt] = useState<PanEvent | null>(null)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const refEl = ref.current

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!refEl) {
        return
      }

      e.preventDefault()
      document.body.classList.add('dragging')

      const originRect = refEl.getBoundingClientRect()
      setOriginRect(originRect)

      const panEvt = {
        isFinal: false,
        isFirst: true,
        location: getLocationRelativeToRect(e, originRect),
        delta: {
          x: 0,
          y: 0,
        },
      }

      hookHandler(panEvt)
      setLastEvt(panEvt)
    }

    refEl?.addEventListener('mousedown', handler)
    return () => refEl?.removeEventListener('mousedown', handler)
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!refEl || lastEvt === null) {
        return
      }

      const location = getLocationRelativeToRect(e, originRect)

      const panEvt = {
        isFinal: false,
        isFirst: false,
        location,
        delta: getDelta(lastEvt.location, location),
      }

      hookHandler(panEvt)
      setLastEvt(panEvt)
    }

    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!refEl || lastEvt === null) {
        return
      }

      const location = getLocationRelativeToRect(e, originRect)
      const panEvt = {
        isFinal: true,
        isFirst: false,
        location,
        delta: getDelta(lastEvt.location, location),
      }

      hookHandler(panEvt)
      setLastEvt(null)
      setOriginRect(null)

      document.body.classList.remove('dragging')
    }

    window.addEventListener('mouseup', handler)
    return () => window.removeEventListener('mouseup', handler)
  })
}
