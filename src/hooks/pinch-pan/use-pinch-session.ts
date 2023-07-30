import { useState } from 'react'

export interface PinchSession {
  referenceArea: number
  lastArea: number
  scaleMultiplier: number
}

export function usePinchSession() {
  const [pinchSession, setPinchSession] = useState<PinchSession | null>(null)

  function setLastDistance(lastArea: number) {
    setPinchSession((session) => {
      if (!session) {
        return null
      }

      return {
        ...session,
        lastArea,
      }
    })
  }

  function getScale(area: number) {
    if (!pinchSession) {
      return -1
    }

    return (area / pinchSession.referenceArea) * pinchSession.scaleMultiplier
  }

  return {
    pinchSession,
    setLastDistance,
    setPinchSession,
    getScale,
  }
}
