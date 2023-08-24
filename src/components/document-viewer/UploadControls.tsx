'use client'

import { Button } from 'antd'
import UploadProcessModal from './UploadProcessModal'
import { useState } from 'react'
import ConditionallyRender from '../common/ConditionallyRender'
import { useAppDispatch } from '@/store/hooks'
import { documentActions } from '@/store/document-slice'

export default function UploadControls() {
  const [opened, setOpened] = useState(false)
  const dispatch = useAppDispatch()

  function openViewerWithNewPDF(urls: string[]) {
    dispatch(documentActions.updatePageUrls(urls))
    setOpened(false)
  }

  return (
    <>
      <Button onClick={() => setOpened(true)}>
        {/* i18nize this */}
        Upload a File
      </Button>

      <ConditionallyRender render={opened}>
        <UploadProcessModal
          open={opened}
          onOk={openViewerWithNewPDF}
          onCancel={() => setOpened(false)}
        />
      </ConditionallyRender>
    </>
  )
}
