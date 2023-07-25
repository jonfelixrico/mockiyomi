import { RefObject } from 'react'
import { PanEvent } from './pan-types'
import { useMousePan } from './use-mouse-pan'
import { useTouchPan } from './use-touch-pan'

export function usePan(
  ref: RefObject<HTMLElement>,
  hookHandler: (event: PanEvent) => void
) {
  useMousePan(ref, hookHandler)
  useTouchPan(ref, hookHandler)
}
