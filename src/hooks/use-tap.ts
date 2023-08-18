import { Point } from '@/types/point.interface'
import { RefObject, useEffect, useState } from 'react'

export function useTap(ref: RefObject<HTMLElement>) {
  const [pointerIds, setPointerIds] = useState(new Set<number>())
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [initialPos, setIntialPos] = useState<Point | null>()
  const [isTap, setIsTap] = useState(false)

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!ref.current) {
        return
      }

      if (pointerIds.size === 0) {
        setStartTime(new Date())
        setIntialPos({
          x: e.clientX,
          y: e.clientY,
        })
      } else if (pointerIds.size >= 1) {
        setIsTap(false)
      }

      setPointerIds((set) => {
        const clone = new Set(set)
        clone.add(e.pointerId)
        return clone
      })
    }

    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [ref, setStartTime, setPointerIds, setIsTap, setIntialPos, pointerIds])

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!ref.current) {
        return
      }
    }

    window.addEventListener('pointermove', handler)
    return () => window.removeEventListener('pointermove', handler)
  }, [ref])

  useEffect(() => {
    const handler = (e: PointerEvent) => {}
    if (!ref.current) {
      return
    }

    window.addEventListener('pointerup', handler)
    return () => window.removeEventListener('pointerup', handler)
  }, [ref])
}
