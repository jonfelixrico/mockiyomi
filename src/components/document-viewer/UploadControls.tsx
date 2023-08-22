'use client'

import { convertPDFToImageUrls } from '@/utils/pdf-utils'
import { Button, Modal } from 'antd'
import { useState } from 'react'

export default function UploadControls() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function handleUpload(evt: InputEvent) {
    const file = evt.dataTransfer?.files[0]

    if (!file) {
      console.log('no file')
      return
    }

    const urls = await convertPDFToImageUrls(await file.arrayBuffer())
    console.log(urls) // TODO change this
  }

  return (
    <>
      <div>
        <Button>Choose File</Button>
      </div>

      <Modal
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        title={'Test'}
      >
        <input type="file" accept=".pdf" onInput={handleUpload} />
      </Modal>
    </>
  )
}
