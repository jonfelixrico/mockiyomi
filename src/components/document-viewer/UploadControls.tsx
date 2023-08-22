'use client'

import { Button, Modal } from 'antd'
import { useState } from 'react'

export default function UploadControls() {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      ></Modal>
    </>
  )
}
