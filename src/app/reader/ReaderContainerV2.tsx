'use client'

import { useMeasure } from 'react-use'
import PageContainerV2 from './PageContainerV2'
import cnBind from 'classnames/bind'
import style from './reader.css'
import { Dimensions } from '@/types/dimensions.interface'
import { useRef } from 'react'
import { useMousePan } from '@/hooks/use-pan'

const cnJoin = cnBind.bind(style)

export default function ReaderContainerV2(props: {
  className?: string
  current: string
  prev?: string
  next?: string
  dims: Dimensions
}) {
  const ref = useRef<null | HTMLDivElement>(null)
  useMousePan(ref, (e) => {
    console.log(e)
  })

  return (
    <div
      ref={ref}
      className={cnJoin(props.className, 'relative overflow-hidden')}
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
