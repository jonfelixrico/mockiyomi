'use client'

import PageNavigator, {
  OnChangePage,
} from '@/components/page-navigator/PageNavigator'
import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { documentActions } from '@/store/document-slice'
import { Dimensions } from '@/types/dimensions.interface'
import NavigationOverlay from './NavigationOverlay'

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

export default function DocumentViewer({
  dimensions,
}: {
  dimensions: Dimensions
}) {
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
  const pageCount = useMemo(() => pageUrls.length, [pageUrls])

  return (
    <NavigationOverlay
      dimensions={dimensions}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      pageCount={pageCount}
    >
      <PageNavigator
        dimensions={dimensions}
        previousUrl={pageUrls[pageIndex - 1]}
        nextUrl={pageUrls[pageIndex + 1]}
        currentUrl={pageUrls[pageIndex]}
        onChangePage={changePageIndex}
        key={pageIndex}
      />
    </NavigationOverlay>
  )
}
