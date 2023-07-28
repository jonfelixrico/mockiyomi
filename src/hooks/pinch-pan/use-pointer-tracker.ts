import { useState } from 'react'

export function usePointerTracker() {
  const [pointerMap, setPointerMap] = useState<Record<string, PointerEvent>>({})

  function setPointer(e: PointerEvent) {
    setPointerMap((map) => {
      return {
        ...map,
        [e.pointerId]: e,
      }
    })
  }

  function removePointer(e: PointerEvent) {
    setPointerMap((map) => {
      const clone = { ...map }
      delete clone[e.pointerId]

      return clone
    })
  }

  return {
    pointerCount: Object.keys(pointerMap).length,
    setPointer,
    removePointer,
  }
}
