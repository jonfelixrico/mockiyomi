/* eslint-disable @next/next/no-img-element */
'use client'

import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions } from '@/types/dimensions.interface'
import joinCn from 'classnames'
import { Point } from '@/types/point.interface'

function useImageMetadata(ref: RefObject<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false)
  const [ratio, setRatio] = useState(1)

  useEffect(() => {
    const img = ref.current

    setLoaded(!!img?.complete)

    if (img?.complete) {
      setRatio(img.naturalWidth / img.naturalHeight)
    }
  }, [ref])

  return {
    loaded,
    ratio,
  }
}

export default function PageContainerV2({
  dimensions,
  src,
  ...props
}: {
  dimensions: Dimensions
  src: string
  className?: string
  scale?: number
  scroll?: Point
}) {
  const ref = useRef<HTMLImageElement>(null)
  const { loaded, ratio } = useImageMetadata(ref)

  const imageDims = useMemo(() => {
    if (dimensions.width >= dimensions.height) {
      // landscape or square
      return {
        height: dimensions.height,
        width: dimensions.height * ratio,
      }
    }

    // portrait
    return {
      width: dimensions.width,
      height: dimensions.width / ratio,
    }
  }, [ratio, dimensions])

  const scaledImageDims = useMemo(() => {
    const scale = props.scale ?? 1
    return {
      width: imageDims.width * scale,
      height: imageDims.height * scale,
    }
  }, [imageDims, props.scale])

  return (
    <div
      style={dimensions}
      className={joinCn(
        'flex flex-row justify-center overflow-hidden',
        props.className
      )}
    >
      {!loaded ? (
        <div className="h-full w-full absolute z-10 flex flex-row justify-center items-center">
          loading
        </div>
      ) : null}

      <img
        src={src}
        ref={ref}
        style={{
          ...scaledImageDims,
          transform: `translateX(${props.scroll?.x ?? 0}px) translateY(${
            props.scroll?.y ?? 0
          }px)`,
        }}
        className="max-w-none"
      />
    </div>
  )
}
