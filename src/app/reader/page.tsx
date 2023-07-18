import ReaderContainer from './ReaderContainer'

const URLS = [
  '/placeholder/1.jpg',
  '/placeholder/2.jpg',
  '/placeholder/3.jpg',
  '/placeholder/4.jpg',
]

export default function Reader() {
  return (
    <>
      <ReaderContainer srcArr={URLS} className="h-screen w-screen" />
    </>
  )
}
