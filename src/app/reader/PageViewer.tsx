'use client'

import { Dimensions } from '@/types/dimensions.interface'
import PageScroller, { ScrollPosition } from './PageScroller'
import { RefObject, useMemo, useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'
import { usePinchPan } from '@/hooks/pinch-pan/use-pinch-pan'

function clampValue(value: number, limits: { min: number; max: number }) {
  const minBound = Math.max(limits.min, value) // prevent value from dipping below the min limit
  return Math.min(minBound, limits.max) // prevent value from going past the max limit
}

function getScrollLimits(content: Dimensions, container: Dimensions) {
  return {
    top: {
      min: 0,
      max: content.height - container.height,
    },

    left: {
      min: 0,
      max: content.height - container.height,
    },
  }
}

function useScrolling(pageDims: Dimensions, containerDims: Dimensions) {
  const [scroll, setScroll] = useState<ScrollPosition>({
    left: 0,
    top: 0,
  })

  const scrollLimits = getScrollLimits(pageDims, containerDims)

  return {
    scroll,
    setScroll(callback: (position: ScrollPosition) => ScrollPosition) {
      setScroll((value) => {
        const raw = callback(value)
        return {
          top: clampValue(raw.top, scrollLimits.top),
          left: clampValue(raw.left, scrollLimits.left),
        }
      })
    },
  }
}

function usePinchPanInterface(
  ref: RefObject<HTMLDivElement>,
  pageDims: Dimensions,
  containerDims: Dimensions
) {
  const { scroll, setScroll } = useScrolling(pageDims, containerDims)

  usePinchPan(ref, ({ panDelta }) => {
    setScroll((val) => {
      return {
        top: val.top + panDelta.y,
        left: val.left + panDelta.x,
      }
    })
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
  const { scroll } = usePinchPanInterface(ref, pageDims, props.dimensions)

  return (
    <div ref={ref} className="cursor-grab">
      <PageScroller dimensions={props.dimensions} scroll={scroll}>
        <ImgWrapper
          alt="dummy"
          containerDimensions={props.dimensions}
          scale={3}
          src={props.src}
          onDimensionsEmit={setPageDims}
        />
      </PageScroller>
    </div>
  )
}
