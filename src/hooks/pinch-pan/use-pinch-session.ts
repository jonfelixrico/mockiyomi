import { useState } from 'react'

export interface PinchSession {
  referenceDistance: number
  lastDistance: number
  multiplier: number
}

export function usePinchSession() {
  const [pinchSession, setPinchSession] = useState<PinchSession | null>(null)

  function setLastDistance(distance: number) {
    setPinchSession((session) => {
      if (!session) {
        return null
      }

      return {
        ...session,
        lastDistance: distance,
      }
    })
  }

  function getScale(distance: number) {
    if (!pinchSession) {
      return -1
    }

    return (distance / pinchSession.referenceDistance) * pinchSession.multiplier
  }

  return {
    pinchSession,
    setLastDistance,
    setPinchSession,
    getScale,
  }
}
