'use client'

import DocumentViewer from '@/components/document-viewer/DocumentViewer'
import { useMeasure } from 'react-use'

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
      <DocumentViewer
        dimensions={dims}
        previousUrl={URLS[0]}
        nextUrl={URLS[2]}
        currentUrl={URLS[1]}
        onChangePage={() => {}}
      />
    </div>
  )
}
