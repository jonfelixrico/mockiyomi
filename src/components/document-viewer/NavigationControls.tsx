import { VerticalLeftOutlined, VerticalRightOutlined } from '@ant-design/icons'
import { Button, Slider } from 'antd'
import { Dispatch, useCallback, useMemo } from 'react'

export function Controls({
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
