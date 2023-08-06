'use client'

import PageNavigator, {
  OnChangePage,
} from '@/components/page-navigator/PageNavigator'
import { useCallback } from 'react'
import { useMeasure } from 'react-use'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { documentActions } from '@/store/document-slice'

function useDocumentData() {
  const dispatch = useAppDispatch()

  const pageIndex = useAppSelector((state) => state.document.pageIndex)
  const setPageIndex = useCallback(
    (index: number) => {
      dispatch(documentActions.setPageIndex(index))
    },
    [dispatch]
  )

  const pageUrls = useAppSelector((state) => state.document.pageUrls)

  return {
    pageIndex,
    setPageIndex,
    pageUrls,
  }
}

export default function ReaderPageWrapper() {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

  const { pageIndex, setPageIndex, pageUrls } = useDocumentData()
  const changePageIndex: OnChangePage = useCallback(
    (value) => {
      if (value === 'next') {
        setPageIndex(pageIndex + 1)
      } else {
        setPageIndex(pageIndex - 1)
      }
    },
    [setPageIndex, pageIndex]
  )

  return (
    <div
      ref={ref}
      className="h-screen w-screen overflow-hidden touch-none overscroll-contain"
    >
      <PageNavigator
        dimensions={{ width, height }}
        previousUrl={pageUrls[pageIndex - 1]}
        nextUrl={pageUrls[pageIndex + 1]}
        currentUrl={pageUrls[pageIndex]}
        onChangePage={changePageIndex}
        key={pageIndex}
      />
    </div>
  )
}
