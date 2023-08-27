import { Steps } from 'antd'

const STEP_ITEMS = [
  {
    title: 'Upload',
  },
  {
    title: 'Convert',
  },
  {
    title: 'Finalize',
  },
]

export default function UploadSteps(props: { stepIndex: number }) {
  return <Steps current={props.stepIndex} items={STEP_ITEMS} />
}
