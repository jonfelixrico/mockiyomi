import { Dimensions } from '@/types/dimensions.interface'
import PageScroller from './PageScroller'
import { useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'
import { PinchPanEvent, usePinchPan } from '@/hooks/use-pinch-pan'
import { useScrollingManager } from './use-scrolling-manager'
import { usePinchingManager } from './use-pinching-manager'
import { useScrollLimits } from './use-scroll-limits'

export type OverscrollHandler = (event: Omit<PinchPanEvent, 'pinch'>) => void

export default function PageViewer({
  dimensions,
  onOverscroll = () => {},
  ...props
}: {
  dimensions: Dimensions
  src: string
  onOverscroll?: OverscrollHandler
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

    const scrollDelta = {
      top: scroll.top - panDelta.y,
      left: scroll.left - panDelta.x,
    }
    if (
      count <= 2 &&
      !pinch &&
      ((scrollLimits.left.min && panDelta.x < 0) ||
        (scrollLimits.left.max && panDelta.x > 0) ||
        (scrollLimits.top.min && panDelta.y < 0) ||
        (scrollLimits.top.max && panDelta.y > 0))
    ) {
      setIsOverscrolling(true)
      onOverscroll(e)
    }

    if (pinch) {
      handlePinch(pinch, panDelta)
    } else {
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
    }
  )

  return (
    <div ref={ref} className="cursor-grab touch-none">
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
