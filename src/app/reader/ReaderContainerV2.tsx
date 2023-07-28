'use client'

import PageContainerV2 from './PageContainerV2'
import cnBind from 'classnames/bind'
import style from './reader.css'
import { Dimensions } from '@/types/dimensions.interface'
import { useRef, useState } from 'react'
import { usePinchPan } from '@/hooks/use-pinch-pan'

const cnJoin = cnBind.bind(style)

export default function ReaderContainerV2(props: {
  className?: string
  current: string
  prev?: string
  next?: string
  dims: Dimensions
}) {
  const [translateX, setTranslateX] = useState(0)
  const [scale, setScale] = useState(1)

  const ref = useRef<null | HTMLDivElement>(null)

  // usePinchPan(ref, ({ isFinal, panDelta }) => {
  //   if (isFinal) {
  //     setTranslateX(0)
  //   } else {
  //     setTranslateX((val) => {
  //       const newGross = val + panDelta.x
  //       return Math.min(Math.max(-props.dims.width, newGross), props.dims.width)
  //     })
  //   }
  // })

  return (
    <div
      ref={ref}
      className={cnJoin(props.className, 'relative touch-none', {
        'transition-transform': !translateX,
      })}
      data-test={translateX}
      style={{
        transform: `translateX(${translateX}px)`,
      }}
    >
      {props.prev ? (
        <PageContainerV2
          src={props.prev}
          dimensions={props.dims}
          className="absolute z-10 prev"
        />
      ) : null}

      {props.next ? (
        <PageContainerV2
          src={props.next}
          dimensions={props.dims}
          className="absolute z-10 next"
        />
      ) : null}

      <PageContainerV2
        src={props.current}
        dimensions={props.dims}
        scale={scale}
      />
    </div>
  )
}
