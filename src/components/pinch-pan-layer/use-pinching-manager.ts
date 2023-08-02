import type { PinchEvent } from '@/hooks/use-pinch-pan'
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
    { scale: delta, isFinal, location }: PinchEvent,
    panDelta: Point
  ) {
    if (isFinal) {
      setPersistedScale(scaleToDisplay)
      setPinchSessionScale(null)
      return
    }

    /*
     * This is just a representation of where the centerpoint of the pinch is.
     * This will act as sort of an anchor.
     */
    const pinchAnchor = {
      x: (location.x + scroll.left) / pageDims.width,
      y: (location.y + scroll.top) / pageDims.height,
    }

    const tempScale = delta * persistedScale

    /*
     * This just computes the resulting dimensions of the page after the pinch
     * instance.
     *
     * We're using bounded scale here because we're have min/max limits for the scale,
     * and if the current scale just so surpasess those we will just bound them to the
     * limits.
     */
    const boundedScale = getBoundedScale(tempScale)
    const dimsAfterResize = {
      width: (pageDims.width / scaleToDisplay) * boundedScale,
      height: (pageDims.height / scaleToDisplay) * boundedScale,
    }

    /*
     * Consider this: you are in a photo viewing app for your phone. Say you have a photo of
     * somebody and you are interesting in zooming in to see the details of their left eye.
     *
     * If you pinch in, the zooming appears to be "anchored" into the left eye -- whether you pinch
     * to zoom in or out, the center point of your finger is still around the eye.
     *
     * That's the purpose of this scroll compensation -- to make it appear like the zoom is anchored
     * to the point that the user is pinching at.
     *
     * The pan is just there to give panning capabilities to the user even though they're pinching.
     */
    const newScrollPositionForScalingCompensation = {
      left: dimsAfterResize.width * pinchAnchor.x - location.x - panDelta.x,
      top: dimsAfterResize.height * pinchAnchor.y - location.y - panDelta.y,
    }
    setScroll(() => newScrollPositionForScalingCompensation)

    /*
     * For future reference, the key steps to the illusion above are:
     *
     * 1. Get the coordinates of where the pinch fingers of the user are. The coordinates are relative to the
     *    subject being pinched-to-zoom before the actual scaling happens.
     * 2. Determine top and left distances of the pinch fingers are from the scroll container. For image-viewing apps,
     *    consider the top and left sides of the device screen as your scroll container.
     * 3. Scale up the coordinates from step 1 accordingly to the new scale.
     * 4. Set the scroll such that the top left corner of the scroll container is exactly on the point in step 3.
     * 5. Add the top and left distance from step 2 to the scroll position in step 4.
     *
     * Viola, you will make it appear like the point didn't move in between scales.
     */

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
