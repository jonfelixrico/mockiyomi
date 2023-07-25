/* eslint-disable @next/next/no-img-element */
'use client'

import { RefObject, useEffect, useRef, useState } from 'react'
import { Dimensions } from '@/types/dimensions.interface'
import joinCn from 'classnames'

function useImageMetadata(ref: RefObject<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false)
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    setLoaded(!!ref.current?.complete)
  }, [ref])

  useEffect(() => {
    const img = ref.current

    if (!img?.complete) {
      return
    }

    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
  }, [ref])

  return {
    loaded,
    dimensions,
  }
}

export default function PageContainerV2({
  dimensions: { height, width },
  src,
  ...props
}: {
  dimensions: Dimensions
  src: string
  className?: string
}) {
  const ref = useRef<HTMLImageElement>(null)
  const { loaded, dimensions: imgDims } = useImageMetadata(ref)

  return (
    <div
      style={{
        height,
        width,
      }}
      className={joinCn('flex flex-row justify-center', props.className)}
    >
      {!loaded ? (
        <div className="h-full w-full absolute z-10 flex flex-row justify-center items-center">
          loading
        </div>
      ) : null}

      <div style={imgDims}>
        <img src={src} ref={ref} />
      </div>
    </div>
  )
}
