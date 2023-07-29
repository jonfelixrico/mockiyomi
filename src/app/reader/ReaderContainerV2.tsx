'use client'

import PageContainerV2 from './PageContainerV2'
import cnBind from 'classnames/bind'
import style from './reader.css'
import { Dimensions } from '@/types/dimensions.interface'
import { useRef, useState } from 'react'
import { usePinchPan } from '@/hooks/pinch-pan/use-pinch-pan'

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
  const [tempScale, setTempScale] = useState<number | null>(null)

  const ref = useRef<null | HTMLDivElement>(null)

  usePinchPan(ref, ({ isFinal, panDelta, pinch }) => {
    // setTranslateX((val) => {
    //   const newGross = val + panDelta.x
    //   return Math.min(Math.max(-props.dims.width, newGross), props.dims.width)
    // })

    if (pinch) {
      if (pinch.isFinal) {
        setTempScale(null)
        setScale((scale) => {
          return scale * (tempScale ?? 1)
        })
      } else {
        setTempScale(pinch.delta)
      }
    }
  })

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
      <div>
        <div className="absolute">
          <div>{scale}</div>
        </div>
        <PageContainerV2
          src={props.current}
          dimensions={props.dims}
          scale={tempScale ? scale * tempScale : scale}
        />
      </div>
    </div>
  )
}
