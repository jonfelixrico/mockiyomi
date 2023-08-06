import { Dispatch, useCallback } from 'react'
import { Button } from 'antd'
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons'

export default function NavigationControls({
  pageUrls,
  pageIndex,
  setPageIndex,
}: {
  pageUrls: string[]
  pageIndex: number
  setPageIndex: Dispatch<number>
}) {
  const goNext = useCallback(() => {
    setPageIndex(Math.min(pageUrls.length - 1, pageIndex + 1))
  }, [setPageIndex, pageIndex, pageUrls])

  const goPrev = useCallback(() => {
    setPageIndex(Math.max(0, pageIndex - 1))
  }, [setPageIndex, pageIndex])

  return (
    <div>
      <Button type="primary" shape="circle" onClick={goNext}>
        <VerticalRightOutlined />
      </Button>

      <div>{/* do something */}</div>

      <Button type="primary" shape="circle" onClick={goPrev}>
        <VerticalLeftOutlined />
      </Button>
    </div>
  )
}
