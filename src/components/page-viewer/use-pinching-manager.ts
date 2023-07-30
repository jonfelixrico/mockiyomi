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
  const [pinchSessionScale, setPinchSessionScale] = useState<null | number>(
    null
  )
  const [persistedScale, setPersistedScale] = useState(1)
  const scaleToDisplay = useMemo(() => {
    if (pinchSessionScale === null) {
      return persistedScale
    }

    return persistedScale * pinchSessionScale
  }, [persistedScale, pinchSessionScale])

  function handlePinch(
    { delta, isFinal, location }: PinchEvent,
    panDelta: Point
  ) {
    if (isFinal) {
      setPersistedScale(scaleToDisplay)
      setPinchSessionScale(null)
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
      width: (pageDims.width / scaleToDisplay) * boundedScale,
      height: (pageDims.height / scaleToDisplay) * boundedScale,
    }

    const pointAfterResize = {
      left: afterResize.width * refPointPercentage.x - location.x - panDelta.x,
      top: afterResize.height * refPointPercentage.y - location.y - panDelta.y,
    }

    setScroll(() => pointAfterResize)

    if (tempScale > MAX_SCALE) {
      setPinchSessionScale(MAX_SCALE / persistedScale)
    } else if (tempScale < MIN_SCALE) {
      setPinchSessionScale(MIN_SCALE / persistedScale)
    } else {
      setPinchSessionScale(delta)
    }
  }

  return {
    scale: scaleToDisplay,
    handlePinch,
  }
}
