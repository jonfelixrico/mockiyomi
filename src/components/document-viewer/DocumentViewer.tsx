'use client'

import { Dimensions } from '@/types/dimensions.interface'
import PageViewer, {
  OverscrollEvent,
} from '@/components/page-viewer/PageViewer'

import styles from './document-viewer.module.css'
import classnames from 'classnames'
import { useState } from 'react'
import { ScrollPosition } from '@/types/scroll-location.interface'

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
  const [translate, setTranslate] = useState<ScrollPosition>({
    left: 0,
    top: 0,
  })
  function handleOverscroll({ isFinal, panDelta: { x, y } }: OverscrollEvent) {
    if (isFinal) {
      setTranslate({
        top: 0,
        left: 0,
      })
    }

    setTranslate(({ top, left }) => {
      return {
        top: top + y,
        left: left + x,
      }
    })
  }

  return (
    <div
      className={classnames('relative origin-top-left', {
        'transition-transform': translate.left === 0 && translate.top === 0,
      })}
      style={{
        // TODO handle y overscroll
        transform: `translateX(${translate.left}px)`,
      }}
    >
      {prevUrl ? (
        <div
          className={classnames('absolute pointer-events-none', styles.prev)}
        >
          <PageViewer dimensions={dimensions} src={prevUrl} />
        </div>
      ) : null}

      {nextUrl ? (
        <div
          className={classnames('absolute pointer-events-none', styles.next)}
        >
          <PageViewer dimensions={dimensions} src={nextUrl} />
        </div>
      ) : null}

      <PageViewer
        dimensions={dimensions}
        src={currentUrl}
        onOverscroll={handleOverscroll}
      />
    </div>
  )
}
