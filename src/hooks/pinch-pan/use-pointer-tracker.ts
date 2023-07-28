import { useState } from 'react'

export function usePointerTracker() {
  const [pointerCache, setPointerCache] = useState<PointerEvent[]>([])

  function setPointer(e: PointerEvent) {
    setPointerCache((cache) => {
      const index = cache.findIndex((p) => p.pointerId === e.pointerId)
      if (index === -1) {
        return [...cache, e]
      }

      // replace the old record of the pointer with the new one
      return cache.slice().splice(index, 1, e)
    })
  }

  function removePointer(e: PointerEvent) {
    setPointerCache((cache) => {
      const index = cache.findIndex((p) => p.pointerId === e.pointerId)

      if (index === -1) {
        // pointer not found so do nothing
        return cache
      }

      // remove pointer from the cache
      return cache.slice().splice(index, 1)
    })
  }

  return {
    pointerCount: pointerCache.length,
    setPointer,
    removePointer,
    originPointer: pointerCache[0]?.pointerId ?? null,
  }
}
