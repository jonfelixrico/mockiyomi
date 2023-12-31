'use client'

import { Dimensions } from '@/types/dimensions.interface'
import PageViewer, {
  OverscrollEvent,
} from '@/components/page-viewer/PageViewer'

import styles from './page-navigator.module.css'
import classnames from 'classnames'
import { useMemo, useState } from 'react'
import { ScrollPosition } from '@/types/scroll-location.interface'
import { Limits } from '@/types/limits.interface'
import { delay } from '@/utils/time-utils'

export type OnChangePage = (direction: 'next' | 'previous') => void

const CHANGE_PAGE_THRESHOLD = 2 / 3

// Taken from the transition-transform class' transition time
const CHANGE_PAGE_ANIMATION_TIME = 150
const SWIPE_TRESHOLD = 250

export default function PageNavigator({
  previousUrl,
  nextUrl,
  dimensions,
  currentUrl,
  onChangePage,
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

  const translateLimits = useMemo(() => {
    const limits: Limits = {
      max: 0,
      min: 0,
    }

    if (nextUrl) {
      limits.min = -dimensions.width
    }

    if (previousUrl) {
      limits.max = dimensions.width
    }

    return limits
  }, [dimensions, previousUrl, nextUrl])

  const [shouldTransition, setShouldTransition] = useState(true)
  const [isForPageChange, setIsForPageChange] = useState(false)

  async function handleOverscroll({
    isFinal,
    panDelta: { x },
    elapsedTime,
  }: OverscrollEvent) {
    if (shouldTransition) {
      setShouldTransition(false)
    }

    if (isFinal) {
      setShouldTransition(true)

      if (
        previousUrl &&
        ((elapsedTime <= SWIPE_TRESHOLD && translate.left > 0) ||
          translate.left > dimensions.width * CHANGE_PAGE_THRESHOLD)
      ) {
        setIsForPageChange(true)
        setTranslate({
          top: 0,
          left: dimensions.width,
        })

        await delay(CHANGE_PAGE_ANIMATION_TIME)
        onChangePage('previous')
      } else if (
        nextUrl &&
        ((elapsedTime <= SWIPE_TRESHOLD && translate.left < 0) ||
          translate.left < -dimensions.width * CHANGE_PAGE_THRESHOLD)
      ) {
        setIsForPageChange(true)
        setTranslate({
          top: 0,
          left: -dimensions.width,
        })

        await delay(CHANGE_PAGE_ANIMATION_TIME)
        onChangePage('next')
      } else {
        setTranslate({
          top: 0,
          left: 0,
        })
      }

      return
    }

    setTranslate(({ left, top }) => {
      return {
        // TODO handle y
        top,
        left: Math.min(
          Math.max(left + x, translateLimits.min),
          translateLimits.max
        ),
      }
    })
  }

  return (
    <div
      className={classnames('relative origin-top-left', {
        'transition-transform': shouldTransition,
        'pointer-events-none': isForPageChange,
      })}
      style={{
        // TODO handle y overscroll
        transform: `translateX(${translate.left}px)`,
      }}
    >
      {previousUrl ? (
        <div
          className={classnames('absolute pointer-events-none', styles.prev)}
        >
          <PageViewer dimensions={dimensions} src={previousUrl} readonly />
        </div>
      ) : null}

      {nextUrl ? (
        <div
          className={classnames('absolute pointer-events-none', styles.next)}
        >
          <PageViewer dimensions={dimensions} src={nextUrl} readonly />
        </div>
      ) : null}

      <PageViewer
        dimensions={dimensions}
        src={currentUrl}
        onOverscroll={handleOverscroll}
        overscroll={{
          left: !!previousUrl,
          right: !!nextUrl,
        }}
      />
    </div>
  )
}
