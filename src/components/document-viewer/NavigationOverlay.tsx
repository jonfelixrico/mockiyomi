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
import { useClickAway } from 'react-use'

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

  const setPageNo = useCallback(
    (value: number) => setPageIndex(value - 1),
    [setPageIndex]
  )
  const pageNo = useMemo(() => pageIndex + 1, [pageIndex])

  return (
    <div className="flex flex-row items-center gap-x-5">
      <Button
        type="primary"
        shape="circle"
        onClick={goPrev}
        icon={<VerticalRightOutlined />}
      />

      <div>{pageNo}</div>

      <div className="grow">
        <Slider value={pageNo} onChange={setPageNo} max={pageCount} min={1} />
      </div>

      <div>{pageCount}</div>

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

  return (
    <div className="relative" style={props.dimensions}>
      <ConditionallyRender render={showOverlay}>
        <div className="absolute h-full w-full flex flex-col justify-end items-stretch z-10 pointer-events-none">
          <div className="px-5 py-3 bg-white border-t border-gray-300 pointer-events-auto">
            <Controls
              pageCount={pageCount}
              pageIndex={pageIndex}
              setPageIndex={setPageIndex}
            />
          </div>
        </div>
      </ConditionallyRender>

      <div
        onClick={() => {
          setShowOverlay((v) => !v)
        }}
        // TouchMove is being used here because we want to close the overlay if page swipes are detected
        onTouchMove={() => setShowOverlay(false)}
      >
        {props.children}
      </div>
    </div>
  )
}
