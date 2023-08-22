'use client'

import OverlayLayout, {
  OnChangePage,
} from '@/components/page-navigator/OverlayLayout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ChangePageIndexPayload, documentActions } from '@/store/document-slice'
import { Dimensions } from '@/types/dimensions.interface'
import NavigationOverlay from './OverlayLayout'

function useDocumentData() {
  const dispatch = useAppDispatch()

  const pageIndex = useAppSelector((state) => state.document.pageIndex)
  const setPageIndex = useCallback(
    (payload: ChangePageIndexPayload) => {
      dispatch(documentActions.setPageIndex(payload))
    },
    [dispatch]
  )
  const pageChangeData = useAppSelector(
    (state) => state.document.pageChangeData
  )

  const pageUrls = useAppSelector((state) => state.document.pageUrls)

  return {
    pageIndex,
    setPageIndex,
    pageUrls,
    pageChangeData,
  }
}

export default function DocumentViewer({
  dimensions,
}: {
  dimensions: Dimensions
}) {
  const { pageIndex, setPageIndex, pageUrls, pageChangeData } =
    useDocumentData()
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

  const [showOverlay, setShowOverlay] = useState(true)

  // This will cause the overlay to close if the page was changed by swiping
  useEffect(() => {
    if (pageChangeData?.intent !== 'FROM_OVERLAY') {
      setShowOverlay(false)
    }
  }, [pageChangeData, setShowOverlay])

  /*
   * Custom page change method for the overlay. This causes page changes via the
   * overlay to not cause the overlay to close.
   */
  const setPageIndexViaOverlay = useCallback(
    (index: number) => {
      setPageIndex({
        index,
        intent: 'FROM_OVERLAY',
      })
    },
    [setPageIndex]
  )

  return (
    <NavigationOverlay
      dimensions={dimensions}
      pageCount={pageCount}
      pageIndex={pageIndex}
      setPageIndex={setPageIndexViaOverlay}
      showOverlay={showOverlay}
      setShowOverlay={setShowOverlay}
    >
      <OverlayLayout
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
