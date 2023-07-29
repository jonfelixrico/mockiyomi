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
  const [scale, setScale] = useState(1)
  const [tempScale, setTempScale] = useState<number | null>(null)

  const [scroll, setScroll] = useState({
    x: 0,
    y: 0,
  })

  const ref = useRef<null | HTMLDivElement>(null)

  usePinchPan(ref, ({ panDelta, pinch }) => {
    if (pinch) {
      if (pinch.isFinal) {
        setTempScale(null)
        setScale((scale) => {
          return scale * (tempScale ?? 1)
        })
      } else {
        setTempScale(pinch.delta)
      }

      setScroll(({ x, y }) => {
        return {
          x: x + panDelta.x,
          y: y + panDelta.y,
        }
      })
    } else {
      setScroll(({ x, y }) => {
        return {
          x: x + panDelta.x,
          y: y + panDelta.y,
        }
      })
    }
  })

  return (
    <div ref={ref} className={cnJoin(props.className, 'relative touch-none')}>
      <PageContainerV2
        src={props.current}
        dimensions={props.dims}
        scale={tempScale ? scale * tempScale : scale}
        scroll={scroll}
      />
    </div>
  )
}
