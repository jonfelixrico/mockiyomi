'use client'

import { convertPDFToImageUrls } from '@/utils/pdf-utils'
import { Button, Modal, Spin, Steps, Upload, UploadFile } from 'antd'
import { useEffect, useState } from 'react'

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

function ProcessingStage(props: {
  file: UploadFile
  onNext: (urls: string[]) => void
}) {
  useEffect(() => {
    const runProcess = async () => {
      const urls = await convertPDFToImageUrls(props.file)
      props.onNext(urls)
    }

    runProcess().catch((e) => {
      // TODO add proper error handling
      console.error(e, 'pdf error')
    })
  })
  return <Spin />
}

function ConfirmationStage(props: {
  urls: string[]
  onNext: (urls: string[]) => void
}) {
  return (
    <div>
      {/* TODO i18nize */}
      <Button onClick={() => props.onNext(props.urls)}>Start Reading</Button>
    </div>
  )
}

const STEP_ITEMS = [
  {
    title: 'Upload',
  },
  {
    title: 'Conversion',
  },
  {
    title: 'Finalization',
  },
]

function StepsWrapper(props: { stepIndex: number }) {
  return <Steps current={props.stepIndex} />
}

export default function UploadProcessModal(props: {
  onOk: (file: UploadFile) => void
  onCancel: () => void
  open: boolean
}) {
  const [stepIndex, setStepIndex] = useState(0)

  return (
    <Modal
      open={props.open}
      footer={null}
      // TODO i18nize this
      title="Select File"
      onCancel={props.onCancel}
    >
      <StepsWrapper stepIndex={stepIndex} />
    </Modal>
  )
}
