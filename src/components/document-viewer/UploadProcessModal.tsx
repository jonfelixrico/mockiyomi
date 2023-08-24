'use client'

import { convertPDFToImageUrls } from '@/utils/pdf-utils'
import { Button, Modal, Spin, Steps, Upload, UploadFile } from 'antd'
import { useEffect, useState } from 'react'
import ConditionallyRender from '../common/ConditionallyRender'

function UploadStage(props: { onNext: (file: UploadFile) => void }) {
  const [file, setFile] = useState<UploadFile | null>(null)

  function acceptFile(file: UploadFile) {
    setFile(file)
    return false
  }

  return (
    <div className="mt-3 gap-2 flex flex-col">
      <Upload
        onRemove={() => setFile(null)}
        beforeUpload={acceptFile}
        maxCount={1}
        className="w-full"
      >
        {/* TODO i18nize */}
        <Button>Upload File</Button>
      </Upload>
      <Button
        disabled={!file}
        onClick={() => props.onNext(file as UploadFile)}
        type="primary"
      >
        {/* TODO i18nize */}
        Next
      </Button>
    </div>
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
  return <Steps current={props.stepIndex} items={STEP_ITEMS} />
}

function getStepIndex(payload?: string[] | UploadFile) {
  if (!payload) {
    return 0
  } else if (Array.isArray(payload)) {
    return 2
  } else {
    // is UploadFile
    return 1
  }
}

export default function UploadProcessModal(props: {
  onOk: (file: UploadFile) => void
  onCancel: () => void
  open: boolean
}) {
  const [payload, setPayload] = useState<string[] | UploadFile>()
  const stepIndex = getStepIndex(payload)

  return (
    <Modal
      open={props.open}
      footer={null}
      // TODO i18nize this
      onCancel={props.onCancel}
      closeIcon={null}
    >
      <StepsWrapper stepIndex={stepIndex} />

      <ConditionallyRender render={stepIndex === 0}>
        <UploadStage
          onNext={(file) => {
            setPayload(file)
          }}
        />
      </ConditionallyRender>

      <ConditionallyRender render={stepIndex === 1}>
        <ProcessingStage
          file={payload as UploadFile}
          onNext={(urls) => {
            setPayload(urls)
          }}
        />
      </ConditionallyRender>
    </Modal>
  )
}
