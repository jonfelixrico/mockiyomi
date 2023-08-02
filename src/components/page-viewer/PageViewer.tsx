import { Dimensions } from '@/types/dimensions.interface'
import PageScroller from './PageScroller'
import { useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'
import { PinchPanEvent, usePinchPan } from '@/hooks/use-pinch-pan'
import { useScrollingManager } from './use-scrolling-manager'
import { usePinchingManager } from './use-pinching-manager'
import { useScrollLimits } from './use-scroll-limits'
import styles from './page-viewer.module.css'
import classnames from 'classnames'
import { Point } from '@/types/point.interface'

export type OverscrollEvent = Omit<PinchPanEvent, 'pinch'>
export interface OverscrollOptions {
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

const PINCHPAN_COUNT_LIMIT_FOR_OVERSCROLL = 10

export default function PageViewer({
  dimensions,
  onOverscroll = () => {},
  overscroll: overflow,
  src,
  ...props
}: {
  dimensions: Dimensions
  src: string
  onOverscroll?: (e: OverscrollEvent) => void
  readonly?: boolean
  overscroll?: OverscrollOptions
  debug?: boolean
}) {
  const [pageDims, setPageDims] = useState<Dimensions>({
    width: 0,
    height: 0,
  })

  const ref = useRef<HTMLDivElement>(null)
  const scrollLimits = useScrollLimits(pageDims, dimensions)

  const { scroll, setScroll } = useScrollingManager(scrollLimits)
  const { handlePinch, scale } = usePinchingManager(scroll, setScroll, pageDims)

  const [isOverscrolling, setIsOverscrolling] = useState(false)
  const [isEligibleForOverscroll, setIsEligibleForOverscroll] = useState(false)
  function checkIfOverscroll(panDelta: Point) {
    if (!overflow) {
      return false
    }

    /*
     * The way we wrote the code below is a conscious decision. We prefer doing if-elses that return boolean
     * literals than directly returning the boolean expression equivalent of the statements below for readability
     * purposes.
     */

    if (
      overflow.left &&
      // The leftmost edge of the content is flush against the leftmost side of the container...
      scroll.left === scrollLimits.left.min &&
      // ...and they swiped left
      panDelta.x > 0
    ) {
      return true
    } else if (
      overflow.right &&
      /*
       * Same pattern as above.
       * The catch here is the first part of the condition above is ignored if the content is smaller
       * than the container.
       *
       * The reason there is that scroll.left will always be zero if the content is smaller
       * than the container.
       */
      (pageDims.width <= dimensions.width ||
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
      disabled: props.readonly,
    }
  )

  return (
    <div ref={ref} className="cursor-grab relative">
      {props.debug ? (
        <div
          className={classnames(
            'absolute w-full break-all text-xs',
            styles['debug-text']
          )}
        >
          <div>{JSON.stringify(pageDims)}</div>
          <div>{JSON.stringify(dimensions)}</div>
          <div>{JSON.stringify(scroll)}</div>
          <div>{JSON.stringify(scrollLimits)}</div>
          <div>{JSON.stringify(scale)}</div>
          <div>{JSON.stringify(isOverscrolling)}</div>
        </div>
      ) : null}

      <PageScroller
        dimensions={dimensions}
        contentDimensions={pageDims}
        scroll={scroll}
      >
        {/* TODO maybe add a proper alt */}
        <ImgWrapper
          alt={src}
          containerDimensions={dimensions}
          scale={scale}
          src={src}
          onDimensionsEmit={setPageDims}
        />
      </PageScroller>
    </div>
  )
}
