import { Dimensions } from '@/types/dimensions.interface'
import { useEffect, useMemo, useRef, useState } from 'react'

function getDimensionsToFitContainer(
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

function scaleDimensions(
  { width, height }: Dimensions,
  scale: number
): Dimensions {
  return {
    width: width * scale,
    height: height * scale,
  }
}

/*
 * This component is responsible for:
 * - Displaying the image
 * - Emitting the fit-to-page dimensions
 */

export default function ImgWrapper({
  containerDimensions,
  onDimensionsEmit,
  scale,
  ...props
}: {
  src: string
  alt: string
  containerDimensions: Dimensions
  scale: number
  onDimensionsEmit?: (dimensions: Dimensions) => void
}) {
  const ref = useRef<HTMLImageElement>(null)

  const [ratio, setRatio] = useState(1)
  function getImageRatio() {
    const img = ref.current

    if (img?.complete) {
      setRatio(img.naturalWidth / img.naturalHeight)
    }
  }

  useEffect(getImageRatio, [ref])

  const fittingDims = useMemo(
    () => getDimensionsToFitContainer(containerDimensions, ratio),
    [containerDimensions, ratio]
  )

  const scaledDims = useMemo(
    () => scaleDimensions(fittingDims, scale),
    [scale, fittingDims]
  )

  useEffect(() => {
    if (!onDimensionsEmit) {
      return
    }

    onDimensionsEmit(scaledDims)
  }, [onDimensionsEmit, scaledDims])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={props.src}
      alt={props.alt}
      className="max-w-none"
      ref={ref}
      style={scaledDims}
      onLoad={getImageRatio}
    />

    /*
     * max-w-none was necessary to override tailwind's fit-to-page behavior
     * for image elements
     */
  )
}
