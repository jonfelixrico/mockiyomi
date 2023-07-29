'use client'

import { Dimensions } from '@/types/dimensions.interface'
import PageScroller, { ScrollPosition } from './PageScroller'
import { useState } from 'react'
import ImgWrapper from './ImgWrapper'

export default function PageViewer({
  ...props
}: {
  dimensions: Dimensions
  src: string
}) {
  const [scroll, setScroll] = useState<ScrollPosition>({
    left: 0,
    top: 0,
  })

  return (
    <div>
      <PageScroller dimensions={props.dimensions} scroll={scroll}>
        <ImgWrapper
          alt="dummy"
          containerDimensions={props.dimensions}
          scale={1}
          src={props.src}
        />
      </PageScroller>
    </div>
  )
}
