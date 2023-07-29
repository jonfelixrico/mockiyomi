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
  onLimitsBroadcast: onSizeBroadcast,
  ...props
}: {
  dimensions: Dimensions
  src: string
  className?: string
  scale?: number
  scroll?: Point
  onLimitsBroadcast?: (dims: Point) => void
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const { loaded, ratio } = useImageMetadata(imgRef)

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

  const scrollOuterLimits = useMemo(() => {
    return {
      x: scaledImageDims.width - dimensions.width,
      y: scaledImageDims.height - dimensions.height,
    }
  }, [scaledImageDims, dimensions])

  useEffect(() => {
    if (onSizeBroadcast) {
      onSizeBroadcast(scrollOuterLimits)
    }
  }, [onSizeBroadcast, scrollOuterLimits])

  const divRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = divRef.current
    if (!el || !props.scroll) {
      return
    }

    el.scrollTo(props.scroll.x, props.scroll.y)
  }, [divRef, props.scroll])

  return (
    <div
      style={dimensions}
      className={joinCn('overflow-hidden', props.className)}
      ref={divRef}
    >
      {!loaded ? (
        <div className="h-full w-full absolute z-10 flex flex-row justify-center items-center">
          loading
        </div>
      ) : null}

      <div
        className="flex flex-row justify-center"
        style={{
          minWidth: dimensions.width,
          minHeight: dimensions.height,
        }}
      >
        <img
          src={src}
          ref={imgRef}
          style={scaledImageDims}
          className="max-w-none"
          alt="dummy"
        />
      </div>
    </div>
  )
}
