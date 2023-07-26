'use client'

import PageContainerV2 from './PageContainerV2'
import cnBind from 'classnames/bind'
import style from './reader.css'
import { Dimensions } from '@/types/dimensions.interface'
import { useRef, useState } from 'react'
import { usePan } from '@/hooks/pan/use-pan'
import { usePinchZoom } from '@/hooks/use-pinch-zoom'

const cnJoin = cnBind.bind(style)

export default function ReaderContainerV2(props: {
  className?: string
  current: string
  prev?: string
  next?: string
  dims: Dimensions
}) {
  const [translateX, setTranslateX] = useState(0)

  const ref = useRef<null | HTMLDivElement>(null)
  usePan(ref, ({ isFinal, delta }) => {
    if (isFinal) {
      setTranslateX(0)
    } else {
      setTranslateX((val) => {
        const newGross = val + delta.x
        return Math.min(Math.max(-props.dims.width, newGross), props.dims.width)
      })
    }
  })

  usePinchZoom(ref, () => {})

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

      <PageContainerV2 src={props.current} dimensions={props.dims} />
    </div>
  )
}
