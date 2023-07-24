'use client'

import { useEffect, useState } from 'react'

interface Coords {
  x: number
  y: number
}

export type PanEvent = {
  location: Coords

  isFirst: boolean
  isFinal: boolean
}

function isDescendant(ancestor: Element, target: EventTarget | null) {
  return (
    ancestor === target ||
    (target instanceof Element && ancestor.contains(target))
  )
}

function getLocation(e: MouseEvent, relativeTo: Element): Coords {
  const rect = relativeTo.getBoundingClientRect()
  return {
    x: e.clientX - rect.x,
    y: e.clientY - rect.y,
  }
}

export function useMousePan(
  target: Element,
  hookHandler: (event: PanEvent) => void
) {
  const [lastEvt, setLastEvt] = useState<PanEvent | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isDescendant(target, e.target)) {
        return
      }

      document.body.classList.add('pointer-events-none')

      const panEvt = {
        isFinal: false,
        isFirst: true,
        location: getLocation(e, target),
      }
      hookHandler(panEvt)
      setLastEvt(panEvt)
    }

    document.body.addEventListener('mousedown', handler)
    return () => document.body.removeEventListener('mousedown', handler)
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (lastEvt === null) {
        return
      }

      const panEvt = {
        isFinal: false,
        isFirst: false,
        location: getLocation(e, target),
      }
      hookHandler(panEvt)
      setLastEvt(panEvt)
    }

    document.body.addEventListener('mousemove', handler)
    return () => document.body.removeEventListener('mousemove', handler)
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (lastEvt === null) {
        return
      }

      const panEvt = {
        isFinal: true,
        isFirst: false,
        location: getLocation(e, target),
      }
      hookHandler(panEvt)
      setLastEvt(null)

      document.body.classList.remove('pointer-events-none')
    }

    document.body.addEventListener('mouseup', handler)
    return () => document.body.removeEventListener('mouseup', handler)
  })
}
