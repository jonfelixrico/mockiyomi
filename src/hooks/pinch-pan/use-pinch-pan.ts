import { Coords } from '@/types/coords.interface'
import { RefObject, useEffect, useState } from 'react'
import { usePointerTracker } from './use-pointer-tracker'

interface Origin {
  client: Coords
  target: Coords
}

export type PinchPanEvent = {
  origin: Coords
  location: Coords

  panDelta: Coords
  pinchDelta: number

  isFirst: boolean
  isFinal: boolean
}

function getCoordsRelativeToTarget(
  { client }: Origin,
  e: PointerEvent
): Coords {
  return {
    x: e.clientX - client.x,
    y: e.clientY - client.y,
  }
}

function getDelta(prev: Coords, now: Coords): Coords {
  return {
    x: now.x - prev.x,
    y: now.y - prev.y,
  }
}

function getCentroid(coords: Coords[]): Coords {
  let sumX = 0
  let sumY = 0

  for (const { x, y } of coords) {
    sumX += x
    sumY += y
  }

  return {
    x: sumX / coords.length,
    y: sumY / coords.length,
  }
}

function getDistance(a: Coords, b: Coords): number {
  const dx = Math.pow(b.x - a.x, 2)
  const dy = Math.pow(b.y - a.y, 2)

  return Math.sqrt(dx + dy)
}

function preparePointers(pointers: PointerEvent[], origin: Origin): Coords[] {
  const uniquesMap: Record<string, PointerEvent> = {}

  for (const evt of pointers) {
    /*
     * We're using the concept of maps to do something like a unique-by-latest
     * operation. Lower-index same-id entries will be overridden by
     * higher-index ones.
     */
    uniquesMap[evt.pointerId] = evt
  }

  return Object.values(uniquesMap).map((pointer) =>
    getCoordsRelativeToTarget(origin, pointer)
  )
}

export function usePinchPan(
  ref: RefObject<HTMLElement>,
  hookListener: (event: PinchPanEvent) => void
) {
  const refEl = ref.current

  const { pointerCount, removePointer, setPointer, pointers } =
    usePointerTracker()

  const [origin, setOrigin] = useState<Origin | null>(null)
  const [lastCoords, setLastCoords] = useState<Coords | null>(null)
  const [lastDistance, setLastDistance] = useState(0)

  // pointer down
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl) {
        return
      }

      if (pointerCount === 0) {
        // Needed to prevent causing highlights once the interaction has started
        e.preventDefault()

        document.body.classList.add('dragging')

        const rect = refEl.getBoundingClientRect()
        const targetOrigin = {
          x: e.clientX - rect.x,
          y: e.clientY - rect.y,
        }
        setOrigin({
          target: targetOrigin,
          client: {
            x: rect.x,
            y: rect.y,
          },
        })

        hookListener({
          isFirst: true,
          isFinal: false,

          origin: targetOrigin,
          location: targetOrigin,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })

        setLastCoords(targetOrigin)
        setLastDistance(0)
      } else {
        // added more fingers to the touchscreen

        hookListener({
          isFirst: false,
          isFinal: false,

          /*
           * Logically, this cannot be origin.
           * We're pretty much doing a "just trust me bro" to the compiler.
           */
          origin: origin?.target as Coords,
          location: lastCoords as Coords,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })

        const uniquePointers = preparePointers(
          [...pointers, e],
          origin as Origin
        )
        setLastCoords(getCentroid(uniquePointers))
        setLastDistance(getDistance(uniquePointers[0], uniquePointers[1]))
      }

      setPointer(e)
    }

    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  })

  // pointer up
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl || !origin) {
        return
      }

      if (pointerCount === 1) {
        // all touches have been removed

        const currCoords = getCoordsRelativeToTarget(origin, e)

        hookListener({
          isFirst: false,
          isFinal: true,

          origin: origin.target,
          location: currCoords,

          panDelta: getDelta(lastCoords as Coords, currCoords),

          pinchDelta: 0,
        })

        // cleanup logic
        setOrigin(null)
        setLastCoords(null)
        document.body.classList.remove('dragging')
      } else {
        // assume that at this point, we only have 1 pointer left

        const remainingPointer = preparePointers(
          pointers.filter((p) => p.pointerId !== e.pointerId),
          origin
        )[0]

        hookListener({
          isFirst: false,
          isFinal: false,

          origin: origin.target,
          location: remainingPointer,

          panDelta: {
            x: 0,
            y: 0,
          },

          pinchDelta: 0,
        })

        setLastCoords(remainingPointer)
        setLastDistance(0)
      }

      removePointer(e)
    }

    window.addEventListener('pointerup', handler, { passive: true })
    return () => window.removeEventListener('pointerup', handler)
  })

  // pointer move
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!refEl || !origin) {
        return
      }

      const uniquePointers = preparePointers([...pointers, e], origin)
      const currCoords = getCentroid(uniquePointers)

      const distance =
        pointerCount === 1
          ? 0
          : getDistance(uniquePointers[0], uniquePointers[1])

      hookListener({
        isFirst: false,
        isFinal: false,

        origin: origin.target as Coords,
        location: currCoords,

        panDelta: getDelta(lastCoords as Coords, currCoords),

        pinchDelta: pointerCount === 1 ? 0 : distance - lastDistance,
      })

      setLastCoords(currCoords)
      setPointer(e)

      if (pointerCount > 1) {
        setLastDistance(distance)
      }
    }

    window.addEventListener('pointermove', handler, { passive: true })
    return () => window.removeEventListener('pointermove', handler)
  })
}
