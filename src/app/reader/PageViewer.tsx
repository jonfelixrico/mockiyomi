'use client'

import { Dimensions } from '@/types/dimensions.interface'
import PageScroller, { ScrollPosition } from './PageScroller'
import { RefObject, useMemo, useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'
import { PinchEvent, usePinchPan } from '@/hooks/pinch-pan/use-pinch-pan'
import { Point } from '@/types/point.interface'

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

function usePinching(
  scroll: ScrollPosition,
  setScroll: (callback: (position: ScrollPosition) => ScrollPosition) => void,
  pageDims: Dimensions
) {
  const [scale, setScale] = useState(1)
  const [stagingScale, setStagingScale] = useState(1)

  const boundScale = Math.min(10, Math.max(1, scale * stagingScale))

  function handlePinch({ delta, isFinal }: PinchEvent, location: Point) {
    const refPoint = {
      x: location.x + scroll.left,
      y: location.y + scroll.top,
    }

    const refPointPercentage = {
      x: refPoint.x / pageDims.width,
      y: refPoint.y / pageDims.height,
    }

    const afterResize = {
      width: (pageDims.width / boundScale) * scale * delta,
      height: (pageDims.height / boundScale) * scale * delta,
    }

    const pointAfterResize = {
      left: afterResize.width * refPointPercentage.x - location.x,
      top: afterResize.height * refPointPercentage.y - location.y,
    }

    if (!pointAfterResize.left || !pointAfterResize.top) {
      alert('zero')
    }

    if (!isFinal) {
      setScroll(() => pointAfterResize)
      setStagingScale(delta)
      return
    }

    // setScroll(() => pointAfterResize)
    setScale(boundScale)
    setStagingScale(1)
  }

  return {
    scale: boundScale,
    handlePinch,
  }
}

function usePinchPanInterface(
  ref: RefObject<HTMLDivElement>,
  pageDims: Dimensions,
  containerDims: Dimensions
) {
  const { scroll, setScroll } = useScrolling(pageDims, containerDims)
  const { handlePinch, scale } = usePinching(scroll, setScroll, pageDims)

  usePinchPan(
    ref,
    ({ panDelta, pinch, location, isFirst, isFinal }) => {
      if (pinch) {
        handlePinch(pinch, location)
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
