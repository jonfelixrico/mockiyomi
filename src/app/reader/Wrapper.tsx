'use client'

import DocumentViewer, {
  OnChangePage,
} from '@/components/document-viewer/DocumentViewer'
import { useCallback, useState } from 'react'
import { useMeasure } from 'react-use'

const URLS = [
  '/placeholder/1.jpg',
  '/placeholder/2.jpg',
  '/placeholder/3.jpg',
  '/placeholder/4.jpg',
]

export default function Wrapper() {
  const [ref, dims] = useMeasure<HTMLDivElement>()

  const [pageIdx, setPageIdx] = useState(0)
  const changePageIdx: OnChangePage = useCallback(
    (value) => {
      if (value === 'next') {
        setPageIdx((idx) => idx + 1)
      } else {
        setPageIdx((idx) => idx - 1)
      }
    },
    [setPageIdx]
  )

  return (
    <div ref={ref} className="h-screen w-screen overflow-hidden">
      <DocumentViewer
        dimensions={dims}
        previousUrl={URLS[pageIdx - 1]}
        nextUrl={URLS[pageIdx + 1]}
        currentUrl={URLS[pageIdx]}
        onChangePage={changePageIdx}
        key={pageIdx}
      />
    </div>
  )
}
