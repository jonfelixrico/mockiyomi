import { Button, Upload } from 'antd'
import { RcFile } from 'antd/es/upload'
import { useState } from 'react'

export default function UploadStepFileSelect(props: {
  onNext: (file: RcFile) => void
}) {
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
