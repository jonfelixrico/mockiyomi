/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { Dimensions } from '@/types/dimensions.interface'
import joinCn from 'classnames'

export default function PageContainerV2({
  dimensions: { height, width },
  src,
  ...props
}: {
  dimensions: Dimensions
  src: string
  className?: string
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      style={{
        height,
        width,
      }}
      className={joinCn(
        'overscroll-auto flex flex-row justify-center',
        props.className
      )}
    >
      {!loaded ? (
        <div className="h-full w-full absolute z-10 flex flex-row justify-center items-center">
          loading
        </div>
      ) : null}

      <img src={src} onLoad={() => setLoaded(true)} />
    </div>
  )
}
