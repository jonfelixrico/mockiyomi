import type { PinchEvent } from '@/hooks/pinch-pan/use-pinch-pan'
import { Dimensions } from '@/types/dimensions.interface'
import { Point } from '@/types/point.interface'
import { ScrollPosition } from '@/types/scroll-location.interface'
import { useMemo, useState } from 'react'

const MAX_SCALE = 10
const MIN_SCALE = 1
function getBoundedScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

export function usePinchingManager(
  scroll: ScrollPosition,
  setScroll: (callback: (position: ScrollPosition) => ScrollPosition) => void,
  pageDims: Dimensions
) {
  const [persistedScale, setPersistedScale] = useState(1)
  const [stagingScale, setStagingScale] = useState(1)
  const actualScale = useMemo(
    () => persistedScale * stagingScale,
    [persistedScale, stagingScale]
  )

  function handlePinch(
    { delta, isFinal, isFirst, location }: PinchEvent,
    panDelta: Point
  ) {
    if (isFinal) {
      setPersistedScale(actualScale)
      setStagingScale(1)
      return
    }

    const refPoint = {
      x: location.x + scroll.left,
      y: location.y + scroll.top,
    }

    const refPointPercentage = {
      x: refPoint.x / pageDims.width,
      y: refPoint.y / pageDims.height,
    }

    const tempScale = delta * persistedScale

    const boundedScale = getBoundedScale(tempScale)
    const afterResize = {
      width: (pageDims.width / actualScale) * boundedScale,
      height: (pageDims.height / actualScale) * boundedScale,
    }

    const pointAfterResize = {
      left: afterResize.width * refPointPercentage.x - location.x - panDelta.x,
      top: afterResize.height * refPointPercentage.y - location.y - panDelta.y,
    }

    setScroll(() => pointAfterResize)

    if (tempScale > MAX_SCALE) {
      setStagingScale(MAX_SCALE / persistedScale)
    } else if (tempScale < MIN_SCALE) {
      setStagingScale(MIN_SCALE / persistedScale)
    } else {
      setStagingScale(delta)
    }
  }

  return {
    scale: actualScale,
    handlePinch,
  }
}
