import { useMemo, useState } from 'react'

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

  const asArray = Object.values(pointerCache).sort(
    (a, b) => a.pointerId - b.pointerId
  )

  return {
    pointerCount: asArray.length,
    setPointer,
    removePointer,
    pointers: asArray,
  }
}
