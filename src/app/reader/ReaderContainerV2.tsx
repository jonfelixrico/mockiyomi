'use client'

import { useMeasure } from 'react-use'
import PageContainerV2 from './PageContainerV2'
import cnBind from 'classnames/bind'
import style from './reader.css'

const cnJoin = cnBind.bind(style)

export default function ReaderContainerV2(props: {
  className?: string
  current: string
  prev?: string
  next?: string
}) {
  const [ref, dims] = useMeasure<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cnJoin(props.className, 'relative overflow-hidden')}
    >
      <div className="absolute">
        {props.prev ? (
          <PageContainerV2
            src={props.prev}
            dimensions={dims}
            className="absolute z-10 prev"
          />
        ) : null}

        {props.next ? (
          <PageContainerV2
            src={props.next}
            dimensions={dims}
            className="absolute z-10 next"
          />
        ) : null}

        <PageContainerV2 src={props.current} dimensions={dims} />
      </div>
    </div>
  )
}
