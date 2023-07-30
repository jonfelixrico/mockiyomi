import { Dimensions } from '@/types/dimensions.interface'
import { ScrollPosition } from '@/types/scroll-location.interface'
import { useMemo, useState } from 'react'
import { ScrollLimits } from './use-scroll-limits'

function clampValue(value: number, limits: { min: number; max: number }) {
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
