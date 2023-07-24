'use client'

import { useEffect, useState } from 'react'

export type PanEvent = {
  delta: {
    x: number
    y: number
  }

  location: {
    x: number
    y: number
  }

  isFirst: boolean
  isFinal: boolean
}

function isDescendant(ancestor: Element, target: EventTarget | null) {
  return (
    ancestor === target ||
    (target instanceof Element && ancestor.contains(target))
  )
}

export function useMousePan(
  target: Element,
  hookHandler: (event: PanEvent) => void
) {
  const [lastEvt, setLastEvt] = useState<MouseEvent | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isDescendant(target, e.target)) {
        return
      }

      document.body.classList.add('pointer-events-none')
      setLastEvt(e)
    }

    document.body.addEventListener('mousedown', handler)
    return () => document.body.removeEventListener('mousedown', handler)
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (lastEvt === null) {
        return
      }

      setLastEvt(e)
    }

    document.body.addEventListener('mousemove', handler)
    return () => document.body.removeEventListener('mousemove', handler)
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (lastEvt === null) {
        return
      }

      document.body.classList.remove('pointer-events-none')
      setLastEvt(null)
    }

    document.body.addEventListener('mouseup', handler)
    return () => document.body.removeEventListener('mouseup', handler)
  })
}
