import { Dimensions } from '@/types/dimensions.interface'
import { Dispatch, ReactNode, useRef, useState } from 'react'
import ConditionallyRender from '../common/ConditionallyRender'
import NavigationControls from './NavigationControls'

export default function NavigationOverlay(props: {
  dimensions: Dimensions
  children: ReactNode

  pageCount: number
  pageIndex: number
  setPageIndex: Dispatch<number>
}) {
  const [showOverlay, setShowOverlay] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative" style={props.dimensions}>
      <div onClick={() => setShowOverlay(true)}>{props.children}</div>

      <ConditionallyRender render={showOverlay}>
        <div className="absoltue h-full w-full flex flex-column justify-end">
          <NavigationControls
            pageIndex={props.pageIndex}
            pageCount={props.pageCount}
            setPageIndex={props.setPageIndex}
          />
        </div>
      </ConditionallyRender>
    </div>
  )
}
