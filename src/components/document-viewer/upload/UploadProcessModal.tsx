'use client'

import { Modal } from 'antd'
import { useState } from 'react'
import ConditionallyRender from '@/components/common/ConditionallyRender'
import { RcFile } from 'antd/es/upload'
import UploadSteps from './UploadSteps'
import UploadStepFileSelect from './UploadStepFileSelect'
import UploadStepRead from './UploadStepRead'
import UploadStepConvert from './UploadStepConvert'

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
      <div className="gap-5 flex flex-col">
        <UploadSteps stepIndex={stepIndex} />

        <div>
          <ConditionallyRender render={stepIndex === 0}>
            <UploadStepFileSelect
              onNext={(file) => {
                setPayload(file)
              }}
            />
          </ConditionallyRender>

          <ConditionallyRender render={stepIndex === 1}>
            <UploadStepConvert
              file={payload as RcFile}
              onNext={(urls) => {
                setPayload(urls)
              }}
            />
          </ConditionallyRender>

          <ConditionallyRender render={stepIndex === 2}>
            <UploadStepRead onNext={props.onOk} urls={payload as string[]} />
          </ConditionallyRender>
        </div>
      </div>
    </Modal>
  )
}
