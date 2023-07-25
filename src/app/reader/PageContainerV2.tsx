/* eslint-disable @next/next/no-img-element */
'use client'

import { RefObject, useEffect, useRef, useState } from 'react'
import { Dimensions } from '@/types/dimensions.interface'
import joinCn from 'classnames'

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
  dimensions: { height, width },
  src,
  ...props
}: {
  dimensions: Dimensions
  src: string
  className?: string
}) {
  const ref = useRef<HTMLImageElement>(null)
  const { loaded, ratio } = useImageMetadata(ref)

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

      <img src={src} ref={ref} />
    </div>
  )
}
