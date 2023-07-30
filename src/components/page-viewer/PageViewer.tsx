import { Dimensions } from '@/types/dimensions.interface'
import PageScroller, { ScrollPosition } from './PageScroller'
import { RefObject, useMemo, useRef, useState } from 'react'
import ImgWrapper from './ImgWrapper'
import { PinchEvent, usePinchPan } from '@/hooks/pinch-pan/use-pinch-pan'
import { useScrollingManager } from './use-scrolling-manager'

const MAX_SCALE = 10
const MIN_SCALE = 1
function getBoundedScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

function usePinching(
  scroll: ScrollPosition,
  setScroll: (callback: (position: ScrollPosition) => ScrollPosition) => void,
  pageDims: Dimensions
) {
  const [persistedScale, setPersistedScale] = useState(1)
  const [stagingScale, setStagingScale] = useState(1)
  const actualScale = useMemo(
    () => persistedScale * stagingScale,
    [persistedScale, stagingScale]
  )

  function handlePinch({ delta, isFinal, isFirst, location }: PinchEvent) {
    if (isFirst) {
      /*
       * Using the first is glitchy.
       * TODO fix the functionality of the first.
       */
      return
    }

    if (isFinal) {
      setPersistedScale(actualScale)
      setStagingScale(1)
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

    const tempScale = delta * persistedScale

    const boundedScale = getBoundedScale(tempScale)
    const afterResize = {
      width: (pageDims.width / actualScale) * boundedScale,
      height: (pageDims.height / actualScale) * boundedScale,
    }

    const pointAfterResize = {
      left: afterResize.width * refPointPercentage.x - location.x,
      top: afterResize.height * refPointPercentage.y - location.y,
    }

    setScroll(() => pointAfterResize)

    if (tempScale > MAX_SCALE) {
      setStagingScale(MAX_SCALE / persistedScale)
    } else if (tempScale < MIN_SCALE) {
      setStagingScale(MIN_SCALE / persistedScale)
    } else {
      setStagingScale(delta)
    }
  }

  return {
    scale: actualScale,
    handlePinch,
  }
}

function usePinchPanInterface(
  ref: RefObject<HTMLDivElement>,
  pageDims: Dimensions,
  containerDims: Dimensions
) {
  const { scroll, setScroll } = useScrollingManager(pageDims, containerDims)
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