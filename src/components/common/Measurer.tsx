import { CSSProperties, ReactNode } from 'react'
import { useMeasure } from 'react-use'

export default function Measurer(props: {
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

  return <div ref={ref} className={props.className} style={props.style}></div>
}
