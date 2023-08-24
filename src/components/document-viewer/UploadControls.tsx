'use client'

import { Button } from 'antd'
import UploadProcessModal from './UploadProcessModal'
import { useState } from 'react'
import ConditionallyRender from '../common/ConditionallyRender'

export default function UploadControls() {
  const [opened, setOpened] = useState(false)

  return (
    <>
      <Button onClick={() => setOpened(true)}>
        {/* i18nize this */}
        Upload a File
      </Button>

      <ConditionallyRender render={opened}>
        <UploadProcessModal
          open={opened}
          onOk={(urls) => {
            // TODO do something
            setOpened(false)
          }}
          onCancel={() => setOpened(false)}
        />
      </ConditionallyRender>
    </>
  )
}
