import { Dimensions } from '@/types/dimensions.interface'
import PageViewer from '@/components/page-viewer/PageViewer'
import './document-viewer.module.css'

type OnChangePage = (direction: 'next' | 'prev') => void

export function DocumentViewer({
  previousUrl: prevUrl,
  nextUrl,
  dimensions,
  currentUrl,
  ...props
}: {
  previousUrl?: string
  currentUrl: string
  nextUrl?: string
  dimensions: Dimensions
  onChangePage: OnChangePage
}) {
  return (
    <div className="relative">
      {prevUrl ? (
        <div className="prev absolute">
          <PageViewer dimensions={dimensions} src={prevUrl} />
        </div>
      ) : null}
      {nextUrl ? (
        <div className="next absolute">
          <PageViewer dimensions={dimensions} src={nextUrl} />
        </div>
      ) : null}
      <PageViewer dimensions={dimensions} src={currentUrl} />
    </div>
  )
}
