import { getPDFDocumentProxy, getPDFPagesAsBlobs } from '@/utils/pdf-utils'
import { Progress, Spin } from 'antd'
import { RcFile } from 'antd/es/upload'
import { useState } from 'react'
import { useMount } from 'react-use'

export default function UploadStepConvert(props: {
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
