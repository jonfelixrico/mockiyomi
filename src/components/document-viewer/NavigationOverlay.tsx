import { Dimensions } from '@/types/dimensions.interface'
import { ReactNode, useRef, useState } from 'react'
import ConditionallyRender from '../common/ConditionallyRender'

export default function NavigationOverlay(props: {
  dimensions: Dimensions
  children: ReactNode
}) {
  const [showOverlay, setShowOverlay] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative" style={props.dimensions}>
      <div onClick={() => setShowOverlay(true)}>{props.children}</div>

      <ConditionallyRender render={showOverlay}>
        <div className="absoltue h-full w-full"></div>
      </ConditionallyRender>
    </div>
  )
}
