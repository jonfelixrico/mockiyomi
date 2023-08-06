import { Dispatch, useCallback } from 'react'
import { Button } from 'antd'
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons'

export default function NavigationControls({
  pageCount,
  pageIndex,
  setPageIndex,
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

  return (
    <div className="flex flex-row items-center">
      <Button type="primary" shape="circle" onClick={goNext}>
        <VerticalRightOutlined />
      </Button>

      <div className="grow">testing</div>

      <Button type="primary" shape="circle" onClick={goPrev}>
        <VerticalLeftOutlined />
      </Button>
    </div>
  )
}
