'use client'

import { useMeasure } from 'react-use'
import PageContainer from './PageContainer'

export default function ReaderContainer({
  srcArr,
  className,
}: {
  className?: string
  srcArr: string[]
}) {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className={className}>
      {srcArr.map((src, idx) => (
        <PageContainer
          dimensions={{
            width,
            height,
          }}
          src={src}
          key={idx}
        />
      ))}
    </div>
  )
}
