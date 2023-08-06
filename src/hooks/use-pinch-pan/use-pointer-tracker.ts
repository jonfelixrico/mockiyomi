import { useState } from 'react'
import { getDeltaOfPoints } from './point-utils'

const DELTA_THRESHOLD = 3

export function usePointerTracker() {
  const [pointerCache, setPointerCache] = useState<
    Record<string, PointerEvent>
  >({})

  function setPointer(e: PointerEvent) {
    setPointerCache((cache) => {
      return {
        ...cache,
        [e.pointerId]: e,
      }
    })
  }

  function removePointer(e: PointerEvent) {
    setPointerCache((cache) => {
      const clone = { ...cache }
      delete clone[e.pointerId]
      return clone
    })
  }

  function shouldIgnorePointer(e: PointerEvent): boolean {
    const stored = pointerCache[e.pointerId]

    if (!stored) {
      return false
    }

    const delta = getDeltaOfPoints(e, pointerCache[e.pointerId])
    return (
      Math.abs(delta.x) < DELTA_THRESHOLD && Math.abs(delta.y) < DELTA_THRESHOLD
    )
  }

  const asArray = Object.values(pointerCache).sort(
    (a, b) => a.pointerId - b.pointerId
  )

  return {
    setPointer,
    removePointer,
    pointers: asArray,
    pointerCount: asArray.length,
    shouldIgnorePointer,
  }
}
