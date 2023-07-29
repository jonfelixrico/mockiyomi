'use client'

import { Dimensions } from '@/types/dimensions.interface'
import PageScroller, { ScrollPosition } from './PageScroller'
import { RefObject, useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'

function usePinchPanInterface(
  ref: RefObject<HTMLDivElement>,
  pageDims: Dimensions
) {
  const [scroll, setScroll] = useState<ScrollPosition>({
    left: 0,
    top: 0,
  })

  return {
    scroll,
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
  const { scroll } = usePinchPanInterface(ref, pageDims)

  return (
    <div ref={ref}>
      <PageScroller dimensions={props.dimensions} scroll={scroll}>
        <ImgWrapper
          alt="dummy"
          containerDimensions={props.dimensions}
          scale={1}
          src={props.src}
          onDimensionsEmit={setPageDims}
        />
      </PageScroller>
    </div>
  )
}
