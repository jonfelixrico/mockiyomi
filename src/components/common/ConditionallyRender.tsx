import { ReactNode } from 'react'

export default function ConditionallyRender(props: {
  render?: Boolean
  children: ReactNode
}) {
  return props.render ? props.children : null
}
