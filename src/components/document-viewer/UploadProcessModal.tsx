'use client'

import { getPDFDocumentProxy, getPDFPagesAsBlobs } from '@/utils/pdf-utils'
import { Button, Modal, Progress, Spin, Steps, Upload } from 'antd'
import { useState } from 'react'
import ConditionallyRender from '../common/ConditionallyRender'
import { RcFile } from 'antd/es/upload'
import { useMount } from 'react-use'

function UploadStage(props: { onNext: (file: RcFile) => void }) {
  const [file, setFile] = useState<RcFile | null>(null)

  function acceptFile(file: RcFile) {
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
        accept="application/pdf"
      >
        {/* TODO i18nize */}
        <Button>Upload File</Button>
      </Upload>
      <Button
        disabled={!file}
        onClick={() => props.onNext(file as RcFile)}
        type="primary"
      >
        {/* TODO i18nize */}
        Next
      </Button>
    </div>
  )
}

function ProcessingStage(props: {
  file: RcFile
  onNext: (urls: string[]) => void
}) {
  const [conversionProgress, setConversionProgress] = useState<{
    pageNo: number
    pageCount: number
  }>()

  useMount(async () => {
    const pdfData = await getPDFDocumentProxy(await props.file.arrayBuffer())

    const pageCount = pdfData.numPages
    let pageNo = 0

    const urls: string[] = []

    for await (const blob of getPDFPagesAsBlobs(pdfData)) {
      urls.push(URL.createObjectURL(blob))
      setConversionProgress({
        pageCount,
        pageNo: ++pageNo,
      })
    }

    props.onNext(urls)
  })
  return (
    <div className="h-[10vh] flex flex-col justify-center items-center">
      {conversionProgress ? (
        <Progress
          type="line"
          percent={Math.round(
            (conversionProgress.pageNo / conversionProgress.pageCount) * 100
          )}
        />
      ) : (
        <Spin />
      )}
    </div>
  )
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

function getStepIndex(payload?: string[] | RcFile) {
  if (!payload) {
    return 0
  } else if (Array.isArray(payload)) {
    return 2
  } else {
    // is RcFile
    return 1
  }
}

export default function UploadProcessModal(props: {
  onOk: (urls: string[]) => void
  onCancel: () => void
  open: boolean
}) {
  const [payload, setPayload] = useState<string[] | RcFile>()
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
          file={payload as RcFile}
          onNext={(urls) => {
            setPayload(urls)
          }}
        />
      </ConditionallyRender>

      <ConditionallyRender render={stepIndex === 2}>
        <ConfirmationStage onNext={props.onOk} urls={payload as string[]} />
      </ConditionallyRender>
    </Modal>
  )
}
