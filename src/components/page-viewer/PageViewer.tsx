import { Dimensions } from '@/types/dimensions.interface'
import PageScroller from './PageScroller'
import { RefObject, useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'
import { usePinchPan } from '@/hooks/pinch-pan/use-pinch-pan'
import { useScrollingManager } from './use-scrolling-manager'
import { usePinchingManager } from './use-pinching-manager'

function usePinchPanInterface(
  ref: RefObject<HTMLDivElement>,
  pageDims: Dimensions,
  containerDims: Dimensions
) {
  const { scroll, setScroll } = useScrollingManager(pageDims, containerDims)
  const { handlePinch, scale } = usePinchingManager(scroll, setScroll, pageDims)

  usePinchPan(
    ref,
    ({ panDelta, pinch, isFirst, isFinal }) => {
      if (pinch) {
        handlePinch(pinch)
      } else if (!isFirst && !isFinal) {
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
        {/* TODO remove scale */}
        <ImgWrapper
          alt="dummy"
          containerDimensions={props.dimensions}
          scale={scale}
          src={props.src}
          onDimensionsEmit={setPageDims}
        />
      </PageScroller>
    </div>
  )
}
