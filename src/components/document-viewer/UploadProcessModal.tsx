'use client'

import { Modal, Upload, UploadFile } from 'antd'
import { useState } from 'react'

export default function UploadProcessModal(props: {
  onOk: (file: UploadFile) => void
  onCancel: () => void
  open: boolean
}) {
  const [file, setFile] = useState<UploadFile | null>(null)

  return (
    <Modal
      open={props.open}
      footer={null}
      // TODO i18nize this
      title="Select File"
    >
      <Upload onRemove={() => setFile(null)} beforeUpload={setFile} />
    </Modal>
  )
}
