import { Dimensions } from '@/types/dimensions.interface'
import { Dispatch, ReactNode, useRef, useState, useCallback } from 'react'
import ConditionallyRender from '../common/ConditionallyRender'
import { Button } from 'antd'
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons'

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

  const goNext = useCallback(() => {
    setPageIndex(Math.min(pageCount - 1, pageIndex + 1))
  }, [setPageIndex, pageIndex, pageCount])

  const goPrev = useCallback(() => {
    setPageIndex(Math.max(0, pageIndex - 1))
  }, [setPageIndex, pageIndex])

  return (
    <div ref={ref} className="relative" style={props.dimensions}>
      <ConditionallyRender render={showOverlay}>
        <div className="absolute h-full w-full flex flex-col justify-end items-stretch z-10">
          <div className="flex flex-row items-center">
            <Button
              type="primary"
              shape="circle"
              onClick={goNext}
              icon={<VerticalRightOutlined />}
            />

            <div className="grow">testing</div>

            <Button
              type="primary"
              shape="circle"
              onClick={goPrev}
              icon={<VerticalLeftOutlined />}
            />
          </div>
        </div>
      </ConditionallyRender>

      <div onClick={() => setShowOverlay(true)}>{props.children}</div>
    </div>
  )
}
