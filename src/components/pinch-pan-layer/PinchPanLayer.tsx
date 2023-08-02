import { Dimensions } from '@/types/dimensions.interface'
import { Dispatch, SetStateAction, useRef, useState } from 'react'
import { PinchPanEvent, usePinchPan } from '@/hooks/use-pinch-pan'
import { usePinchingManager } from './use-pinching-manager'
import { useScrollLimits } from './use-scroll-limits'
import styles from './page-viewer.module.css'
import classnames from 'classnames'
import { Point } from '@/types/point.interface'
import { ScrollPosition } from '@/types/scroll-location.interface'
import { Limits } from '@/types/limits.interface'

export type OverscrollEvent = Omit<PinchPanEvent, 'pinch'>
export interface OverscrollOptions {
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

function clampValue(value: number, limits: Limits) {
  const minBound = Math.max(limits.min, value) // prevent value from dipping below the min limit
  return Math.min(minBound, limits.max) // prevent value from going past the max limit
}

const PINCHPAN_COUNT_LIMIT_FOR_OVERSCROLL = 10

export default function PinchPanLayer({
  containerDims,
  onOverscroll = () => {},
  overscroll,
  contentDims,

  scroll,
  setScroll,
  ...props
}: {
  containerDims: Dimensions
  contentDims: Dimensions

  onOverscroll?: (e: OverscrollEvent) => void
  overscroll?: OverscrollOptions

  scroll: ScrollPosition
  setScroll: Dispatch<SetStateAction<ScrollPosition>>

  scale: number
  setScale: Dispatch<SetStateAction<number>>

  debug?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  const scrollLimits = useScrollLimits(contentDims, containerDims)
  function setScrollHelper(
    callback: (position: ScrollPosition) => ScrollPosition
  ) {
    setScroll((value) => {
      const raw = callback(value)
      return {
        top: clampValue(raw.top, scrollLimits.top),
        left: clampValue(raw.left, scrollLimits.left),
      }
    })
  }

  const { handlePinch, scale } = usePinchingManager(
    scroll,
    setScrollHelper,
    contentDims
  )

  const [isOverscrolling, setIsOverscrolling] = useState(false)
  const [isEligibleForOverscroll, setIsEligibleForOverscroll] = useState(false)
  function checkIfOverscroll(panDelta: Point) {
    if (!overscroll) {
      return false
    }

    /*
     * The way we wrote the code below is a conscious decision. We prefer doing if-elses that return boolean
     * literals than directly returning the boolean expression equivalent of the statements below for readability
     * purposes.
     */

    if (
      overscroll.left &&
      // The leftmost edge of the content is flush against the leftmost side of the container...
      scroll.left === scrollLimits.left.min &&
      // ...and they swiped left
      panDelta.x > 0
    ) {
      return true
    } else if (
      overscroll.right &&
      /*
       * Same pattern as above.
       * The catch here is the first part of the condition above is ignored if the content is smaller
       * than the container.
       *
       * The reason there is that scroll.left will always be zero if the content is smaller
       * than the container.
       */
      (contentDims.width <= containerDims.width ||
        // The use of comparators and max/floor is to have proper detection despite having float values
        scroll.left >= Math.min(scrollLimits.left.max)) &&
      panDelta.x < 0
    ) {
      return true
    }

    // TODO handle y overscroll

    return false
  }

  function processHandling(e: PinchPanEvent) {
    const { panDelta, pinch, count } = e

    if (isOverscrolling) {
      onOverscroll(e)
      return
    }

    if (
      isEligibleForOverscroll &&
      count <= PINCHPAN_COUNT_LIMIT_FOR_OVERSCROLL &&
      !pinch &&
      checkIfOverscroll(panDelta)
    ) {
      setIsOverscrolling(true)
      onOverscroll(e)
      return
    }

    if (pinch) {
      setIsEligibleForOverscroll(false)
      handlePinch(pinch, panDelta)
    } else {
      const scrollDelta = {
        top: scroll.top - panDelta.y,
        left: scroll.left - panDelta.x,
      }
      setScroll(() => scrollDelta)
    }
  }

  usePinchPan(
    ref,
    (e) => {
      processHandling(e)

      if (e.isFinal) {
        setIsOverscrolling(false)
        setIsEligibleForOverscroll(true)
      }
    },
    {
      className: 'cursor-grabbing',
    }
  )

  return (
    <div ref={ref} className="cursor-grab relative" style={containerDims}>
      {props.debug ? (
        <div
          className={classnames(
            'w-full break-all text-xs',
            styles['debug-text']
          )}
        >
          <div>{JSON.stringify(contentDims)}</div>
          <div>{JSON.stringify(containerDims)}</div>
          <div>{JSON.stringify(scroll)}</div>
          <div>{JSON.stringify(scrollLimits)}</div>
          <div>{JSON.stringify(scale)}</div>
          <div>{JSON.stringify(isOverscrolling)}</div>
        </div>
      ) : null}
    </div>
  )
}
