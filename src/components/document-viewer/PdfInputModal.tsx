'use client'

import { Modal, Upload, UploadFile } from 'antd'
import { useState } from 'react'

export default function PDFInputModal(props: {
  onOk: (file: UploadFile) => void
  onCancel: () => void
  open: boolean
}) {
  const [file, setFile] = useState<UploadFile | null>(null)

  return (
    <Modal
      open={props.open}
      onCancel={props.onCancel}
      onOk={() => props.onOk(file as UploadFile)}
      okButtonProps={{
        disabled: !file,
      }}
      // TODO i18nize this
      title="Select File"
    >
      <Upload onRemove={() => setFile(null)} beforeUpload={setFile} />
    </Modal>
  )
}