import { Dimensions } from '@/types/dimensions.interface'
import PageScroller from './PageScroller'
import { RefObject, useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'
import { usePinchPan } from '@/hooks/pinch-pan/use-pinch-pan'
import { useScrollingManager } from './use-scrolling-manager'
import { usePinchingManager } from './use-pinching-manager'
import { useScrollLimits } from './use-scroll-limits'

function usePinchPanInterface(
  ref: RefObject<HTMLDivElement>,
  pageDims: Dimensions,
  containerDims: Dimensions
) {
  const scrollLimits = useScrollLimits(pageDims, containerDims)
  
  const { scroll, setScroll } = useScrollingManager(scrollLimits)
  const { handlePinch, scale } = usePinchingManager(scroll, setScroll, pageDims)

  usePinchPan(
    ref,
    ({ panDelta, pinch }) => {
      if (pinch) {
        handlePinch(pinch, panDelta)
      } else {
        setScroll((val) => {
          return {
            top: val.top - panDelta.y,
            left: val.left - panDelta.x,
          }
        })
      }
    },
    {
      className: 'cursor-grabbing',
    }
  )

  return {
    scroll,
    scale,
  }
}

export default function PageViewer({
  ...props
}: {
  dimensions: Dimensions
  src: string
}) {
  const [pageDims, setPageDims] = useState<Dimensions>({
    width: 0,
    height: 0,
  })

  const ref = useRef<HTMLDivElement>(null)
  const { scroll, scale } = usePinchPanInterface(
    ref,
    pageDims,
    props.dimensions
  )

  return (
    <div ref={ref} className="cursor-grab touch-none">
      <PageScroller
        dimensions={props.dimensions}
        contentDimensions={pageDims}
        scroll={scroll}
      >
        {/* TODO maybe add a proper alt */}
        <ImgWrapper
          alt={props.src}
          containerDimensions={props.dimensions}
          scale={scale}
          src={props.src}
          onDimensionsEmit={setPageDims}
        />
      </PageScroller>
    </div>
  )
}
