import { Coords } from '@/types/coords.interface'

export type PanEvent = {
  location: Coords
  delta: Coords

  isFirst: boolean
  isFinal: boolean
}
