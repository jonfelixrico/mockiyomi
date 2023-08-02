import { ScrollPosition } from '@/types/scroll-location.interface'
import { useState } from 'react'
import { ScrollLimits } from './use-scroll-limits'
import { Limits } from '@/types/limits.interface'

function clampValue(value: number, limits: Limits) {
  const minBound = Math.max(limits.min, value) // prevent value from dipping below the min limit
  return Math.min(minBound, limits.max) // prevent value from going past the max limit
}

export function useScrollingManager(scrollLimits: ScrollLimits) {
  const [scroll, setScroll] = useState<ScrollPosition>({
    left: 0,
    top: 0,
  })

  return {
    scroll,
    setScroll(callback: (position: ScrollPosition) => ScrollPosition) {
      setScroll((value) => {
        const raw = callback(value)
        return {
          top: clampValue(raw.top, scrollLimits.top),
          left: clampValue(raw.left, scrollLimits.left),
        }
      })
    },
  }
}
