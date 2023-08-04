'use client'

import PageNavigator, {
  OnChangePage,
} from '@/components/page-navigator/PageNavigator'
import { useCallback, useState } from 'react'
import { useMeasure } from 'react-use'

const URLS = new Array(8)
  .fill(null)
  .map((_, index) => `/placeholder/${index + 1}.jpg`)

export default function Wrapper() {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

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
    <div
      ref={ref}
      className="h-screen w-screen overflow-hidden touch-none overscroll-contain"
    >
      <PageNavigator
        dimensions={{ width, height }}
        previousUrl={URLS[pageIdx - 1]}
        nextUrl={URLS[pageIdx + 1]}
        currentUrl={URLS[pageIdx]}
        onChangePage={changePageIdx}
        key={pageIdx}
      />
    </div>
  )
}
