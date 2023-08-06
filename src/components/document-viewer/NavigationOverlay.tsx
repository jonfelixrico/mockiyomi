import { Dimensions } from '@/types/dimensions.interface'
import {
  Dispatch,
  ReactNode,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react'
import ConditionallyRender from '../common/ConditionallyRender'
import { Button, Slider } from 'antd'
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons'

function Controls({
  setPageIndex,
  pageCount,
  pageIndex,
}: {
  pageCount: number
  pageIndex: number
  setPageIndex: Dispatch<number>
}) {
  const goNext = useCallback(() => {
    setPageIndex(Math.min(pageCount - 1, pageIndex + 1))
  }, [setPageIndex, pageIndex, pageCount])

  const goPrev = useCallback(() => {
    setPageIndex(Math.max(0, pageIndex - 1))
  }, [setPageIndex, pageIndex])

  const setSliderValue = useCallback(
    (value: number) => setPageIndex(value - 1),
    [setPageIndex]
  )
  const sliderValue = useMemo(() => pageIndex + 1, [pageIndex])

  return (
    <div className="flex flex-row items-center">
      <Button
        type="primary"
        shape="circle"
        onClick={goPrev}
        icon={<VerticalRightOutlined />}
      />

      <div className="grow">
        <Slider
          value={sliderValue}
          onChange={setSliderValue}
          max={pageCount}
          min={1}
        />
      </div>

      <Button
        type="primary"
        shape="circle"
        onClick={goNext}
        icon={<VerticalLeftOutlined />}
      />
    </div>
  )
}

export default function NavigationOverlay({
  setPageIndex,
  pageCount,
  pageIndex,
  ...props
}: {
  dimensions: Dimensions
  children: ReactNode

  pageCount: number
  pageIndex: number
  setPageIndex: Dispatch<number>
}) {
  const [showOverlay, setShowOverlay] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative" style={props.dimensions}>
      <ConditionallyRender render={showOverlay}>
        <div className="absolute h-full w-full flex flex-col justify-end items-stretch z-10">
          <Controls
            pageCount={pageCount}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
          />
        </div>
      </ConditionallyRender>

      <div onClick={() => setShowOverlay(true)}>{props.children}</div>
    </div>
  )
}
