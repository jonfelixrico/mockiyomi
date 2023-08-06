import { Dimensions } from '@/types/dimensions.interface'
import { Dispatch } from 'react'

export default function DocumentNavigator(props: {
  pageUrls: string[]
  pageIndex: number
  setPageIndex: Dispatch<number>
  dimensions: Dimensions
}) {
  return <div style={props.dimensions}>{/* TODO add content */}</div>
}
