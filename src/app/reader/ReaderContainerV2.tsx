'use client'

import { useMeasure } from 'react-use'
import PageContainerV2 from './PageContainerV2'
import cnJoin from 'classnames'

export default function ReaderContainerV2(props: {
  className?: string
  current: string
  prev?: string
  next?: string
}) {
  const [ref, dims] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className={cnJoin(props.className, 'relative')}>
      {props.prev ? (
        <PageContainerV2
          src={props.prev}
          dimensions={dims}
          className="absolute z-10"
        />
      ) : null}

      {props.next ? (
        <PageContainerV2
          src={props.next}
          dimensions={dims}
          className="absolute z-10"
        />
      ) : null}

      <PageContainerV2 src={props.current} dimensions={dims} />
    </div>
  )
}
