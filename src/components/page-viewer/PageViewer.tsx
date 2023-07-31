import { Dimensions } from '@/types/dimensions.interface'
import PageScroller from './PageScroller'
import { useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'
import { usePinchPan } from '@/hooks/use-pinch-pan'
import { useScrollingManager } from './use-scrolling-manager'
import { usePinchingManager } from './use-pinching-manager'
import { useScrollLimits } from './use-scroll-limits'
import { Point } from '@/types/point.interface'

export type OverscrollHandler = (event: Point | null) => void

export default function PageViewer({
  dimensions,
  onOverscroll,
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

  usePinchPan(
    ref,
    ({ panDelta, pinch }) => {
      if (pinch) {
        handlePinch(pinch, panDelta)
        return
      }

      const scrollDelta = {
        top: scroll.top - panDelta.y,
        left: scroll.left - panDelta.x,
      }

      if (
        (scrollDelta.top > scrollLimits.top.max ||
          scrollDelta.top < scrollLimits.top.min ||
          scrollDelta.left > scrollLimits.top.max ||
          scrollDelta.left < scrollLimits.top.min) &&
        onOverscroll
      ) {
        onOverscroll(panDelta)
      } else {
        setScroll(() => scrollDelta)
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
