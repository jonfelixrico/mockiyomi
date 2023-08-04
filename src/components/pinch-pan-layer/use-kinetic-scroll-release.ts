import { Point } from '@/types/point.interface'
import { ScrollPosition } from '@/types/scroll-location.interface'
import { clamp } from 'lodash'
import { Dispatch, SetStateAction, useState } from 'react'
import { useInterval } from 'react-use'

interface KineticParameters {
  amplitude: Point
  startTimestamp: number

  lastDelta: Point
}

const AMPLITUDE_LIMIT = 10

export function useKineticScrollRelease({
  setScroll,
}: {
  setScroll: Dispatch<SetStateAction<ScrollPosition>>
}) {
  const [params, setParams] = useState<KineticParameters>()

  function start({ x, y }: Point) {
    setParams({
      amplitude: {
        x: clamp(0.8 * x, -AMPLITUDE_LIMIT, AMPLITUDE_LIMIT),
        y: clamp(0.8 * y, -AMPLITUDE_LIMIT, AMPLITUDE_LIMIT),
      },
      startTimestamp: Date.now(),
      lastDelta: {
        x: 0,
        y: 0,
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

      const { startTimestamp, amplitude, lastDelta } = params

      const elapsed = Date.now() - startTimestamp

      const factor = Math.exp(-elapsed / 325)
      const absoluteDelta = {
        x: -amplitude.x * factor,
        y: -amplitude.y * factor,
      }

      if (Math.abs(absoluteDelta.x) < 0.5 && Math.abs(absoluteDelta.y) < 0.5) {
        stop()
        return
      }

      const relativeDelta = {
        x: absoluteDelta.x - lastDelta.x,
        y: absoluteDelta.y - lastDelta.y,
      }
      setScroll((scroll) => {
        return {
          left: scroll.left - relativeDelta.x,
          top: scroll.top - relativeDelta.y,
        }
      })

      setParams((params) => {
        if (!params) {
          throw new Error('params is undefined')
        }

        return {
          ...params,
          lastdelta: absoluteDelta,
        }
      })
    },
    params ? 1 : null
  )

  return {
    startKineticScroll: start,
    stopKineticScroll: stop,
  }
}
