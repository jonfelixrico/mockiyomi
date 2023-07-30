import { Dimensions } from '@/types/dimensions.interface'
import { useMemo } from 'react'

interface Limits {
  min: number
  max: number
}

export interface ScrollLimits {
  top: Limits
  left: Limits
}

export function useScrollLimits(
  pageDims: Dimensions,
  containerDims: Dimensions
) {
  return useMemo(() => {
    return {
      top: {
        min: 0,
        max: pageDims.height - containerDims.height,
      },

      left: {
        min: 0,
        max: pageDims.width - containerDims.width,
      },
    }
  }, [pageDims, containerDims])
}
