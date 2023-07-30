import { useState } from 'react'

export interface PinchSession {
  referenceDistance: number
  lastDistance: number
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

  return {
    pinchSession,
    setLastDistance,
    setPinchSession,
  }
}
