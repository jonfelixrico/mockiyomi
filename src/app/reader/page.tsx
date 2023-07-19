import ReaderContainerV2 from './ReaderContainerV2'

const URLS = [
  '/placeholder/1.jpg',
  '/placeholder/2.jpg',
  '/placeholder/3.jpg',
  '/placeholder/4.jpg',
]

export default function Reader() {
  return (
    <>
      <ReaderContainerV2
        current={URLS[1]}
        next={URLS[2]}
        prev={URLS[0]}
        className="h-screen w-screen"
      />
    </>
  )
}
