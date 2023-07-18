'use client'

import { Dimensions } from '../types/dimensions.interface'

export default function PageContainer({
  dimensions: { height, width },
  src,
}: {
  dimensions: Dimensions
  src: string
}) {
  return (
    <div
      style={{
        height,
        width,
      }}
    >
      <img src={src} />
    </div>
  )
}
