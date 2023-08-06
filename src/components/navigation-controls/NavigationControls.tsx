import { Dispatch } from 'react'
import { Button } from 'antd'
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons'

export default function NavigationControls(props: {
  pageUrls: string[]
  pageIndex: number
  setPageIndex: Dispatch<number>
}) {
  return (
    <div>
      <Button type="primary" shape="circle">
        <VerticalRightOutlined />
      </Button>

      <div>{/* do something */}</div>

      <Button type="primary" shape="circle">
        <VerticalLeftOutlined />
      </Button>
    </div>
  )
}
