export interface Coords {
  x: number
  y: number
}

export type PanEvent = {
  location: Coords
  delta: Coords

  isFirst: boolean
  isFinal: boolean
}
