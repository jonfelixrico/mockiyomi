'use client'

import { Button, Modal, Upload, UploadFile } from 'antd'
import { useState } from 'react'

function UploadStage(props: { onNext: (file: UploadFile) => void }) {
  const [file, setFile] = useState<UploadFile | null>(null)

  return (
    <>
      <Upload onRemove={() => setFile(null)} beforeUpload={setFile} />
      <Button
        disabled={!file}
        onClick={() => props.onNext(file as UploadFile)}
      />
    </>
  )
}

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
