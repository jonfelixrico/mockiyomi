'use client'

import { useMeasure } from 'react-use'
import ReaderContainerV2 from './ReaderContainerV2'
import PageViewer from '@/components/page-viewer/PageViewer'

const URLS = [
  '/placeholder/1.jpg',
  '/placeholder/2.jpg',
  '/placeholder/3.jpg',
  '/placeholder/4.jpg',
]

export default function Wrapper() {
  const [ref, dims] = useMeasure<HTMLDivElement>()
  return (
    <div ref={ref} className="h-screen w-screen overflow-hidden">
      {/* <ReaderContainerV2
        dims={dims}
        current={URLS[1]}
        next={URLS[2]}
        prev={URLS[0]}
      /> */}
      <PageViewer dimensions={dims} src={URLS[0]} />
    </div>
  )
}
