'use client'

import { Dimensions } from '@/types/dimensions.interface'
import PageViewer from '@/components/page-viewer/PageViewer'

import styles from './document-viewer.module.css'
import classnames from 'classnames'

type OnChangePage = (direction: 'next' | 'prev') => void

export default function DocumentViewer({
  previousUrl: prevUrl,
  nextUrl,
  dimensions,
  currentUrl,
  ...props
}: {
  previousUrl?: string
  currentUrl: string
  nextUrl?: string
  dimensions: Dimensions
  onChangePage: OnChangePage
}) {
  return (
    <div className="relative">
      {prevUrl ? (
        <div className={classnames('absolute', styles.prev)}>
          <PageViewer dimensions={dimensions} src={prevUrl} />
        </div>
      ) : null}
      {nextUrl ? (
        <div className={classnames('absolute', styles.next)}>
          <PageViewer dimensions={dimensions} src={nextUrl} />
        </div>
      ) : null}
      <PageViewer dimensions={dimensions} src={currentUrl} />
    </div>
  )
}
