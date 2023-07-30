'use client'

import { useMeasure } from 'react-use'
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
      <PageViewer dimensions={dims} src={URLS[0]} />
    </div>
  )
}
