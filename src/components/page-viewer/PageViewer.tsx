import { Dimensions } from '@/types/dimensions.interface'
import PageScroller from './PageScroller'
import { useMemo, useState } from 'react'
import { PinchPanEvent } from '@/hooks/use-pinch-pan'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ScrollPosition } from '@/types/scroll-location.interface'
import ImgWrapper from './ImgWrapper'
import PinchPanLayer from '../pinch-pan-layer/PinchPanLayer'
import { pageMetadataActions } from '@/store/page-metadata-slice'
import useRatioStore from './use-ratio-store'
import { getDimensionsToFitContainer } from '@/utils/scale-utils'

export type OverscrollEvent = Omit<PinchPanEvent, 'pinch'>
export interface OverscrollOptions {
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

export default function PageViewer({
  dimensions: containerDims,
  onOverscroll = () => {},
  overscroll,
  src,
  ...props
}: {
  dimensions: Dimensions
  src: string
  onOverscroll?: (e: OverscrollEvent) => void
  readonly?: boolean
  overscroll?: OverscrollOptions
}) {
  const { ratio, setRatio } = useRatioStore(src)

  const contentDims = useMemo(
    () => getDimensionsToFitContainer(containerDims, ratio),
    [ratio, containerDims]
  )

  const [scroll, setScroll] = useState<ScrollPosition>({
    top: 0,
    left: 0,
  })

  const [scale, setScale] = useState<number>(1)

  const scaledContentDims = useMemo(() => {
    return {
      width: contentDims.width * scale,
      height: contentDims.height * scale,
    }
  }, [contentDims, scale])

  return (
    <div className="relative">
      {!props.readonly ? (
        <div className="absolute">
          <PinchPanLayer
            scroll={scroll}
            setScroll={setScroll}
            scale={scale}
            setScale={setScale}
            overscroll={overscroll}
            onOverscroll={onOverscroll}
            contentDims={contentDims}
            containerDims={containerDims}
          />
        </div>
      ) : null}

      <PageScroller
        scroll={scroll}
        contentDimensions={scaledContentDims}
        dimensions={containerDims}
      >
        <ImgWrapper
          alt={src}
          style={scaledContentDims}
          src={src}
          onRatioEmit={setRatio}
        />
      </PageScroller>
    </div>
  )
}
