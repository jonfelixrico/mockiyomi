'use client'

import { useMeasure } from 'react-use'
import { Dimensions } from '../types/dimensions.interface'

export default function ReaderContainer({
  onResize,
  className,
}: {
  onResize: (dims: Dimensions) => React.ReactNode
  className: string
}) {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className={className}>
      {onResize({
        width,
        height,
      })}
    </div>
  )
}
