import { Dimensions } from '@/types/dimensions.interface'
import { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react'
import { PinchPanEvent, usePinchPan } from '@/hooks/use-pinch-pan'
import styles from './pinch-pan-layer.module.css'
import classnames from 'classnames'
import { Point } from '@/types/point.interface'
import { ScrollPosition } from '@/types/scroll-location.interface'
import { usePinchingManager } from './use-pinching-manager'
import { useScrollManager } from './use-scroll-manager'
import { useKineticScrolling } from './use-kinetic-scrolling'

export type OverscrollEvent = Omit<PinchPanEvent, 'pinch'>
export interface OverscrollOptions {
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

const PINCHPAN_COUNT_LIMIT_FOR_OVERSCROLL = 10
const VELOCITY_THRESHOLD = 25

export default function PinchPanLayer({
  containerDims,
  onOverscroll = () => {},
  overscroll,
  contentDims,

  scroll,
  setScroll,

  scale,
  setScale,

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
  const scaledContentDims = useMemo(() => {
    return {
      width: contentDims.width * scale,
      height: contentDims.height * scale,
    }
  }, [scale, contentDims])

  const { limitedSetScroll, scrollLimits } = useScrollManager({
    contentDims: scaledContentDims,
    containerDims,
    setScroll,
  })

  const { handlePinch } = usePinchingManager(
    scroll,
    limitedSetScroll,

    scale,
    setScale,

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
      // ...and they swiped right
      panDelta.x > 0
    ) {
      return true
    } else if (
      overscroll.right &&
      /*
       * Same pattern as above.
       * The use of comparators and max/floor is to have proper detection despite having float values
       */
      scroll.left >= Math.min(scrollLimits.left.max) &&
      panDelta.x < 0
    ) {
      return true
    }

    // TODO handle y overscroll

    return false
  }

  const { startKineticScroll, stopKineticScroll } = useKineticScrolling({
    setScroll: limitedSetScroll,
    scroll,
  })

  function processHandling(e: PinchPanEvent) {
    const { panDelta, pinch, count, isFirst, isFinal, velocity } = e

    if (isFirst) {
      // stop any ongoing kinetic scroll
      stopKineticScroll()
    }

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
    } else if (
      isFinal &&
      // Scroll has enough velocity to do an inertia effect
      (Math.abs(velocity.x) >= VELOCITY_THRESHOLD ||
        Math.abs(velocity.y) >= VELOCITY_THRESHOLD)
    ) {
      startKineticScroll(e.velocity)
    } else {
      // for non-final scrolls, or for final scrolls that didn't make the cut

      const scrollDelta = {
        top: scroll.top - panDelta.y,
        left: scroll.left - panDelta.x,
      }
      limitedSetScroll(() => scrollDelta)
    }
  }

  const [lastEvent, setLastEvent] = useState<PinchPanEvent>()

  const ref = useRef<HTMLDivElement>(null)
  usePinchPan(
    ref,
    (e) => {
      processHandling(e)

      if (e.isFinal) {
        setIsOverscrolling(false)
        setIsEligibleForOverscroll(true)
      }

      if (props.debug) {
        setLastEvent(e)
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
            'w-full break-all text-xs pointer-events-none',
            styles['debug-text']
          )}
        >
          <div>{JSON.stringify(contentDims)}</div>
          <div>{JSON.stringify(scaledContentDims)}</div>
          <div>{JSON.stringify(containerDims)}</div>
          <div>{JSON.stringify(scroll)}</div>
          <div>{JSON.stringify(scrollLimits)}</div>
          <div>{JSON.stringify(scale)}</div>
          <div>{JSON.stringify(isOverscrolling)}</div>
          <div>{JSON.stringify(lastEvent)}</div>
        </div>
      ) : null}
    </div>
  )
}
