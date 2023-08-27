import { Button } from 'antd'

export default function UploadStepRead(props: {
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
