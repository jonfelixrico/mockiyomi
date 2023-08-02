import { Dimensions } from '@/types/dimensions.interface'
import { Limits } from '@/types/limits.interface'
import { useMemo } from 'react'

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
        /*
         * The computation inside abs can yield negative values. We need to properly detect
         * which among the values are higher and lower to avoid negative values.
         *
         * Using Math.abs is a simpler way to prevent negative values.
         */
        max: Math.abs(pageDims.height - containerDims.height),
      },

      left: {
        min: 0,
        max: Math.abs(pageDims.width - containerDims.width),
      },
    }
  }, [pageDims, containerDims])
}
