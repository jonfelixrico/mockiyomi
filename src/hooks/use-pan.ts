'use client'

import { RefObject, useEffect, useState } from 'react'

interface Coords {
  x: number
  y: number
}

export type PanEvent = {
  location: Coords
  delta: Coords

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

function getDelta(past: Coords, current: Coords): Coords {
  return {
    x: current.x - past.x,
    y: current.y - past.y,
  }
}

export function useMousePan(
  ref: RefObject<Element>,
  hookHandler: (event: PanEvent) => void
) {
  const [lastEvt, setLastEvt] = useState<PanEvent | null>(null)
  const target = ref.current

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!target || !isDescendant(target, e.target)) {
        return
      }

      document.body.classList.add('dragging')

      const panEvt = {
        isFinal: false,
        isFirst: true,
        location: getLocation(e, target),
        delta: {
          x: 0,
          y: 0,
        },
      }

      hookHandler(panEvt)
      setLastEvt(panEvt)
    }

    document.body.addEventListener('mousedown', handler)
    return () => document.body.removeEventListener('mousedown', handler)
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!target || lastEvt === null) {
        return
      }

      const location = getLocation(e, target)

      const panEvt = {
        isFinal: false,
        isFirst: false,
        location,
        delta: getDelta(lastEvt.location, location),
      }

      hookHandler(panEvt)
      setLastEvt(panEvt)
    }

    document.body.addEventListener('mousemove', handler)
    return () => document.body.removeEventListener('mousemove', handler)
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!target || lastEvt === null) {
        return
      }

      const location = getLocation(e, target)
      const panEvt = {
        isFinal: true,
        isFirst: false,
        location,
        delta: getDelta(lastEvt.location, location),
      }

      hookHandler(panEvt)
      setLastEvt(null)

      document.body.classList.remove('dragging')
    }

    document.body.addEventListener('mouseup', handler)
    return () => document.body.removeEventListener('mouseup', handler)
  })
}
