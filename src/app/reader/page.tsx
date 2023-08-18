'use client'

import Measurer from '@/components/common/Measurer'
import DocumentViewer from '@/components/document-viewer/DocumentViewer'

export default function ReaderPageWrapper() {
  return (
    <Measurer
      className="h-screen w-screen overflow-hidden touch-none overscroll-contain"
      render={(dimensions) => <DocumentViewer dimensions={dimensions} />}
    />
  )
}
