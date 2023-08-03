import { Dimensions } from '@/types/dimensions.interface'
import { useScrollLimits } from './use-scroll-limits'
import { ScrollPosition } from '@/types/scroll-location.interface'
import { Dispatch, SetStateAction, useCallback } from 'react'
import { Limits } from '@/types/limits.interface'

function clampValue(value: number, limits: Limits) {
  const minBound = Math.max(limits.min, value) // prevent value from dipping below the min limit
  return Math.min(minBound, limits.max) // prevent value from going past the max limit
}

export function useScrollManager({
  contentDims,
  containerDims,
  setScroll,
}: {
  contentDims: Dimensions
  containerDims: Dimensions

  setScroll: Dispatch<SetStateAction<ScrollPosition>>
}) {
  const scrollLimits = useScrollLimits(contentDims, containerDims)
  const limitedSetScroll = useCallback(
    (input: SetStateAction<ScrollPosition>) => {
      setScroll((value) => {
        const raw = typeof input === 'function' ? input(value) : input

        return {
          top: clampValue(raw.top, scrollLimits.top),
          left: clampValue(raw.left, scrollLimits.left),
        }
      })
    },
    [setScroll, scrollLimits]
  )

  return {
    scrollLimits,
    limitedSetScroll,
  }
}
