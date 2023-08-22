'use client'

import * as pdfJsLib from 'pdfjs-dist'

pdfJsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'

type GetDocumentParam = Parameters<typeof pdfJsLib.getDocument>[0]

async function getPageImageAsBlob(page: pdfJsLib.PDFPageProxy): Promise<Blob> {
  const viewport = page.getViewport({ scale: 1 })

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: canvas.getContext('2d') as CanvasRenderingContext2D,
    viewport,
  }).promise

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('blank blob'))
      }
    })
  })
}

export async function convertPDFToImageUrls(
  src: GetDocumentParam
): Promise<string[]> {
  const loadingTask = pdfJsLib.getDocument(src)
  const documentData = await loadingTask.promise

  const pageCount = documentData.numPages
  const urls: string[] = []

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    let pageData: pdfJsLib.PDFPageProxy | null = null

    try {
      pageData = await documentData.getPage(pageNumber)
      const pageBlob = await getPageImageAsBlob(pageData)
      urls.push(URL.createObjectURL(pageBlob))
    } finally {
      if (pageData) {
        pageData.cleanup()
      }
    }
  }

  return urls
}
