'use client'

import { getPDFDocumentProxy, getPDFPagesAsBlobs } from '@/utils/pdf-utils'
import { Button, Modal, Progress, Spin, Upload } from 'antd'
import { useState } from 'react'
import ConditionallyRender from '@/components/common/ConditionallyRender'
import { RcFile } from 'antd/es/upload'
import { useMount } from 'react-use'
import UploadSteps from './UploadSteps'
import UploadStepFileSelect from './UploadStepFileSelect'

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
    <div className="h-[10vh] flex flex-col">
      {/* TODO i18nize */}
      <div className="grow flex flex-col justify-center items-center">
        Your file is now ready for reading.
      </div>
      <Button type="primary" onClick={() => props.onNext(props.urls)} block>
        Start Reading
      </Button>
    </div>
  )
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
      <UploadSteps stepIndex={stepIndex} />

      <ConditionallyRender render={stepIndex === 0}>
        <UploadStepFileSelect
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
