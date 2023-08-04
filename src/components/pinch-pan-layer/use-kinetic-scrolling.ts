import { Point } from '@/types/point.interface'
import { ScrollPosition } from '@/types/scroll-location.interface'
import { Dispatch, SetStateAction, useState } from 'react'
import { useInterval } from 'react-use'

interface KineticParameters {
  amplitude: Point
  startTimestamp: number
  target: ScrollPosition
}

/*
 * This kinetic scrolling approach was adopted from
 * https://ariya.io/2013/11/javascript-kinetic-scrolling-part-2,
 * https://github.com/ariya/kinetic.
 */

export function useKineticScrolling({
  scroll,
  setScroll,
}: {
  scroll: ScrollPosition
  setScroll: Dispatch<SetStateAction<ScrollPosition>>
}) {
  const [params, setParams] = useState<KineticParameters>()

  function start({ x, y }: Point) {
    const amplitude = {
      x: 0.8 * x,
      y: 0.8 * y,
    }

    setParams({
      amplitude,
      startTimestamp: Date.now(),
      target: {
        left: Math.round(scroll.left + amplitude.x),
        top: Math.round(scroll.top + amplitude.y),
      },
    })
  }

  function stop() {
    setParams(undefined)
  }

  useInterval(
    () => {
      if (!params) {
        return
      }

      const { startTimestamp, amplitude, target } = params

      const elapsed = Date.now() - startTimestamp

      const factor = Math.exp(-elapsed / 325)
      const delta = {
        x: -amplitude.x * factor,
        y: -amplitude.y * factor,
      }

      if (Math.abs(delta.x) > 0.5 || Math.abs(delta.y) > 0.5) {
        setScroll({
          left: target.left + delta.x,
          top: target.top + delta.y,
        })
      } else {
        stop()
        setScroll(target)
      }
    },
    params ? 1 : null
  )

  return {
    startKineticScroll: start,
    stopKineticScroll: stop,
  }
}
