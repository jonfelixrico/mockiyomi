import { Point } from '@/types/point.interface'
import { RefObject, useEffect, useState } from 'react'
import { isPointerEventWithinElement } from '@/utils/dom-utils'

const TAP_TIME_THRESHOLD = 300
const DISTANCE_THRESHOLD = 3

export function useTap(ref: RefObject<HTMLElement>, hookListener: () => void) {
  const [pointerIds, setPointerIds] = useState(new Set<number>())
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [initialPos, setIntialPos] = useState<Point | null>()
  const [qualifiesAsTap, setQualifiesAsTap] = useState(false)

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!ref.current || !isPointerEventWithinElement(e, ref.current)) {
        return
      }

      if (pointerIds.size === 0) {
        setStartTime(new Date())
        setIntialPos({
          x: e.clientX,
          y: e.clientY,
        })
      } else if (pointerIds.size >= 1) {
        setQualifiesAsTap(false)
      }

      setPointerIds((set) => {
        const clone = new Set(set)
        clone.add(e.pointerId)
        return clone
      })
    }

    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [
    ref,
    setStartTime,
    setPointerIds,
    setQualifiesAsTap,
    setIntialPos,
    pointerIds,
  ])

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!ref.current || !pointerIds.has(e.pointerId) || !initialPos) {
        return
      }

      if (
        Math.abs(e.clientX - initialPos.x) > DISTANCE_THRESHOLD ||
        Math.abs(e.clientY - initialPos.y) > DISTANCE_THRESHOLD
      ) {
        setQualifiesAsTap(false)
      }
    }

    window.addEventListener('pointermove', handler)
    return () => window.removeEventListener('pointermove', handler)
  }, [ref, pointerIds, setQualifiesAsTap, initialPos])

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!ref.current || !pointerIds.has(e.pointerId)) {
        return
      }

      if (
        pointerIds.size === 1 &&
        qualifiesAsTap &&
        startTime &&
        new Date().getTime() - startTime.getTime() <= TAP_TIME_THRESHOLD
      ) {
        hookListener()
      }

      setPointerIds((set) => {
        const clone = new Set(set)
        clone.delete(e.pointerId)
        return clone
      })
    }

    window.addEventListener('pointerup', handler)
    return () => window.removeEventListener('pointerup', handler)
  }, [ref, setPointerIds, pointerIds, qualifiesAsTap, hookListener, startTime])
}
