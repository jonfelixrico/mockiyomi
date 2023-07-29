import { Dimensions } from '@/types/dimensions.interface'
import { Point } from '@/types/point.interface'
import { ReactNode, useEffect, useRef } from 'react'

export interface ScrollPosition {
  top: number
  left: number
}

/*
 * This component is in charge of *displayling* the scrolling for the page based
 * on the props provided to it.
 *
 * It should be noted that this component cannot initiate a scroll.
 */

export default function PageScroller({
  dimensions,
  scroll,
  ...props
}: {
  children?: ReactNode
  dimensions: Dimensions
  scroll: ScrollPosition
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    el.scrollTo(scroll.left, scroll.top)
  }, [ref, scroll])

  return (
    <div className="overflow-hidden" style={dimensions} ref={ref}>
      {/* This wrapping layer for the child takes care of centering
       * the child if its width/height is smaller than the dimension props'
       * width/height
       */}
      <div
        className="flex flex-row justify-center"
        style={{
          minWidth: dimensions.width,
          minHeight: dimensions.height,
        }}
      >
        {props.children}
      </div>
    </div>
  )
}
