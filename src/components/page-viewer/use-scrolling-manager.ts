import { Dimensions } from '@/types/dimensions.interface'
import { useMemo, useState } from 'react'

export interface ScrollPosition {
  top: number
  left: number
}

function getScrollLimits(content: Dimensions, container: Dimensions) {
  return {
    top: {
      min: 0,
      max: content.height - container.height,
    },

    left: {
      min: 0,
      max: content.width - container.width,
    },
  }
}

function clampValue(value: number, limits: { min: number; max: number }) {
  const minBound = Math.max(limits.min, value) // prevent value from dipping below the min limit
  return Math.min(minBound, limits.max) // prevent value from going past the max limit
}

export function useScrollingManager(
  pageDims: Dimensions,
  containerDims: Dimensions
) {
  const [scroll, setScroll] = useState<ScrollPosition>({
    left: 0,
    top: 0,
  })

  const scrollLimits = useMemo(
    () => getScrollLimits(pageDims, containerDims),
    [pageDims, containerDims]
  )

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
