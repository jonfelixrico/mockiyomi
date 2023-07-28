import { useState } from 'react'

export function usePointerTracker() {
  const [pointerCache, setPointerCache] = useState<PointerEvent[]>([])

  function setPointer(e: PointerEvent) {
    setPointerCache((cache) => {
      const index = cache.findIndex(
        (cached) => cached.pointerId === e.pointerId
      )

      // new pointer, so append
      if (index === -1) {
        return [...cache, e]
      }

      // replace the old record of the pointer with the new one
      const clone = [...cache]
      clone[index] = e
      return clone
    })
  }

  function removePointer(e: PointerEvent) {
    setPointerCache((cache) => {
      const index = cache.findIndex(
        (cached) => cached.pointerId === e.pointerId
      )

      if (index === -1) {
        // pointer not found so do nothing
        return cache
      }

      // remove pointer from the cache
      const clone = [...cache]
      clone.splice(index, 1)
      return clone
    })
  }

  return {
    pointerCount: pointerCache.length,
    setPointer,
    removePointer,
    originPointer: pointerCache[0]?.pointerId ?? null,
  }
}
