import { RefObject, useEffect } from 'react'

export function useTap(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!ref.current) {
        return
      }
    }

    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [ref])

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
