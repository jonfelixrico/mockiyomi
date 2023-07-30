'use client'

import { Dimensions } from '@/types/dimensions.interface'
import PageScroller, { ScrollPosition } from './PageScroller'
import { RefObject, useMemo, useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'
import { PinchEvent, usePinchPan } from '@/hooks/pinch-pan/use-pinch-pan'

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
      max: content.width - container.width,
    },
  }
}

function useScrolling(pageDims: Dimensions, containerDims: Dimensions) {
  const [scroll, setScroll] = useState<ScrollPosition>({
    left: 0,
    top: 0,
  })

  const scrollLimits = useMemo(
    () => getScrollLimits(pageDims, containerDims),
    [pageDims, containerDims]
  )

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

const MIN_SCALE = 1
const MAX_SCALE = 10

function usePinching(
  scroll: ScrollPosition,
  setScroll: (callback: (position: ScrollPosition) => ScrollPosition) => void,
  pageDims: Dimensions
) {
  const [scale, setScale] = useState(1)
  const [stagingScale, setStagingScale] = useState(1)

  const boundScale = Math.min(
    MAX_SCALE,
    Math.max(MIN_SCALE, scale * stagingScale)
  )

  function handlePinch({ delta, isFinal, location }: PinchEvent) {
    if (isFinal) {
      setScale(boundScale)
      setStagingScale(1)
      return
    }

    if (delta * scale < MIN_SCALE || delta * scale > MAX_SCALE) {
      return
    }

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

    setScroll(() => pointAfterResize)
    setStagingScale(delta)
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
