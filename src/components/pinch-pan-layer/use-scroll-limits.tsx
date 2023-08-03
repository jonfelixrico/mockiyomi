import { Dimensions } from '@/types/dimensions.interface'
import { Limits } from '@/types/limits.interface'
import { useMemo } from 'react'

export interface ScrollLimits {
  top: Limits
  left: Limits
}

export function useScrollLimits(
  contentDims: Dimensions,
  containerDims: Dimensions
) {
  return useMemo(() => {
    return {
      top: {
        min: 0,
        max:
          contentDims.height >= containerDims.height
            ? contentDims.height - containerDims.height
            : 0,
      },

      left: {
        min: 0,
        max:
          contentDims.width >= containerDims.height
            ? contentDims.width - containerDims.width
            : 0,
      },
    }
  }, [contentDims, containerDims])
}
