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

export type OverscrollEvent = Omit<PinchPanEvent, 'pinch'>
export interface OverscrollOptions {
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

export default function PageViewer({
  dimensions,
  onOverscroll = () => {},
  overscroll: overflow,
  ...props
}: {
  dimensions: Dimensions
  src: string
  onOverscroll?: (e: OverscrollEvent) => void
  readonly?: boolean
  overscroll?: OverscrollOptions
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

  function processHandling(e: PinchPanEvent) {
    const { panDelta, pinch, count } = e

    if (isOverscrolling) {
      onOverscroll(e)
      return
    }

    if (
      count <= 2 &&
      !pinch &&
      // TODO move this in a separate method or something
      ((overflow?.left &&
        scroll.left === scrollLimits.left.min &&
        panDelta.x > 0) ||
        (overflow?.right &&
          (pageDims.width <= dimensions.width ||
            // The use of comparators and max/floor is to have proper detection despite having float values
            scroll.left >= Math.min(scrollLimits.left.max)) &&
          panDelta.x < 0))
      // TODO handle y overscroll
    ) {
      setIsOverscrolling(true)
      onOverscroll(e)
      return
    }

    if (pinch) {
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
      }
    },
    {
      className: 'cursor-grabbing',
      disabled: props.readonly,
    }
  )

  return (
    <div ref={ref} className="cursor-grab touch-none relative">
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
      </div>
      <PageScroller
        dimensions={dimensions}
        contentDimensions={pageDims}
        scroll={scroll}
      >
        {/* TODO maybe add a proper alt */}
        <ImgWrapper
          alt={props.src}
          containerDimensions={dimensions}
          scale={scale}
          src={props.src}
          onDimensionsEmit={setPageDims}
        />
      </PageScroller>
    </div>
  )
}
