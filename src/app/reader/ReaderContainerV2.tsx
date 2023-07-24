'use client'

import { useMeasure } from 'react-use'
import PageContainerV2 from './PageContainerV2'
import cnBind from 'classnames/bind'
import style from './reader.css'
import { Dimensions } from '@/types/dimensions.interface'

const cnJoin = cnBind.bind(style)

export default function ReaderContainerV2(props: {
  className?: string
  current: string
  prev?: string
  next?: string
  dims: Dimensions
}) {
  return (
    <div className={cnJoin(props.className, 'relative overflow-hidden')}>
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
