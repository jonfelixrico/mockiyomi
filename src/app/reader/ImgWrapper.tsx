import { Dimensions } from '@/types/dimensions.interface'
import { useEffect, useMemo, useRef, useState } from 'react'

function getDimensionsToFitContainer(
  containerDims: Dimensions,
  ratio: number
): Dimensions {
  if (containerDims.width >= containerDims.height) {
    // landscape or square
    return {
      height: containerDims.height,
      width: containerDims.height * ratio,
    }
  }

  // portrait
  return {
    width: containerDims.width,
    height: containerDims.width / ratio,
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
  ...props
}: {
  src: string
  alt: string
  containerDimensions: Dimensions
  scale: number
  onDimensionsEmit: (dimensions: Dimensions) => void
}) {
  const ref = useRef<HTMLImageElement>(null)

  const [ratio, setRatio] = useState(1)
  useEffect(() => {
    const img = ref.current

    if (img?.complete) {
      setRatio(img.naturalWidth / img.naturalHeight)
    }
  }, [ref])

  const fittingDims = useMemo(
    () => getDimensionsToFitContainer(containerDimensions, ratio),
    [containerDimensions, ratio]
  )
  useEffect(() => {
    if (!onDimensionsEmit) {
      return
    }

    onDimensionsEmit(fittingDims)
  }, [onDimensionsEmit, fittingDims])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={props.src}
      alt={props.alt}
      className="max-w-none"
      ref={ref}
      style={scaleDimensions(fittingDims, props.scale)}
    />
  )
}
