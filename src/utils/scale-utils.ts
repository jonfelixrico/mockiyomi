import { Dimensions } from '@/types/dimensions.interface'

export function getDimensionsToFitContainer(
  containerDims: Dimensions,
  imageRatio: number
): Dimensions {
  const containerRatio = containerDims.width / containerDims.height

  if (imageRatio <= containerRatio) {
    /*
     * Scenarios:
     * Landscape container, portrait image
     * Landscape container, landscape image, but image has smaller height
     */

    // Fit height
    return {
      height: containerDims.height,
      width: containerDims.height * imageRatio,
    }
  } else {
    /*
     * Scenarios:
     * Portrait container, landscape image
     * Portrait container, portrait image, but image has narrower width
     */

    // Fit width
    return {
      width: containerDims.width,
      height: containerDims.width / imageRatio,
    }
  }
}
