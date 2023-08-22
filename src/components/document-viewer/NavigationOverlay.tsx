import { Dimensions } from '@/types/dimensions.interface'
import {
  Dispatch,
  ReactNode,
  useCallback,
  useMemo,
  SetStateAction,
} from 'react'
import { Button, Slider } from 'antd'
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons'
import classnames from 'classnames'

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
  showOverlay,
  setShowOverlay,
  ...props
}: {
  dimensions: Dimensions
  children: ReactNode

  pageCount: number

  pageIndex: number
  setPageIndex: Dispatch<number>

  showOverlay: boolean
  setShowOverlay: Dispatch<SetStateAction<boolean>>
}) {
  const toggleOverlay = useCallback(() => {
    setShowOverlay((showOverlay) => !showOverlay)
  }, [setShowOverlay])

  return (
    <div className="relative" style={props.dimensions}>
      <div className="absolute h-full w-full flex flex-col justify-between items-stretch z-10 pointer-events-none">
        <div
          className={classnames(
            'px-5 py-3 bg-white border-b border-gray-300 transition-transform',
            {
              'pointer-events-auto': showOverlay,
            }
          )}
          style={{
            transform: `translateY(${showOverlay ? 0 : -100}%)`,
          }}
        >
          {/* TODO add content */}
        </div>

        <div
          className={classnames(
            'px-5 py-3 bg-white border-t border-gray-300 transition-transform',
            {
              'pointer-events-auto': showOverlay,
            }
          )}
          style={{
            transform: `translateY(${showOverlay ? 0 : 100}%)`,
          }}
        >
          <Controls
            pageCount={pageCount}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
          />
        </div>
      </div>

      {/* Clicking on the content will toggle showing of the overlay */}
      <div onClick={toggleOverlay}>{props.children}</div>
    </div>
  )
}
