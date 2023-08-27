import { getPDFDocumentProxy, getPDFPagesAsBlobs } from '@/utils/pdf-utils'
import { Progress, Spin } from 'antd'
import { RcFile } from 'antd/es/upload'
import { useState } from 'react'
import { useMount } from 'react-use'

interface ConversionProgress {
  pageNo: number
  pageCount: number
}

export default function UploadStepConvert(props: {
  file: RcFile
  onNext: (urls: string[]) => void
}) {
  const [conversionProgress, setConversionProgress] =
    useState<ConversionProgress>()

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

  if (!conversionProgress) {
    return (
      <div className="flex flex-col justify-center items-center gap-2">
        <div>Reading your file...</div>
        <Spin />
      </div>
    )
  }

  return (
    <div className="gap-2">
      <div>Preparing your file for viewing...</div>
      <Progress
        type="line"
        percent={Math.round(
          (conversionProgress.pageNo / conversionProgress.pageCount) * 100
        )}
      />
    </div>
  )
}
