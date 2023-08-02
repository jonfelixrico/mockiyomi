import { CSSProperties, useCallback, useEffect, useRef } from 'react'

export default function ImgWrapperV2({
  onRatioEmit,
  ...props
}: {
  src: string
  alt: string
  style?: CSSProperties
  className?: string
  onRatioEmit: (ratio: number) => void
}) {
  const ref = useRef<HTMLImageElement>(null)

  const getImageRatio = useCallback(() => {
    const img = ref.current

    if (img?.complete) {
      onRatioEmit(img.naturalWidth / img.naturalHeight)
    }
  }, [ref, onRatioEmit])

  useEffect(getImageRatio, [getImageRatio])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={props.src}
      alt={props.alt}
      className={props.className}
      ref={ref}
      style={props.style}
      onLoad={getImageRatio}
    />
  )
}
