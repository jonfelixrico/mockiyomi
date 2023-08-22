'use client'

import pdfJsLib, { getDocument } from 'pdfjs-dist'

pdfJsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'

type GetDocumentParam = Parameters<typeof getDocument>[0]

export async function convertPDFToImageUrls(
  src: GetDocumentParam
): Promise<string[]> {
  const loadingTask = getDocument(src)
  const documentData = await loadingTask.promise

  const pageCount = documentData.numPages

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const pageData = await documentData.getPage(pageNumber)
  }

  return [] // TODO remove this bogus output
}
