'use client'

import { Dimensions } from '@/types/dimensions.interface'
import canvasSize from 'canvas-size'
import * as pdfJsLib from 'pdfjs-dist'

pdfJsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'

type GetDocumentParam = Parameters<typeof pdfJsLib.getDocument>[0]

let cachedMaxSize: Promise<Dimensions> | null = null
async function getMaxCanvasSize() {
  if (cachedMaxSize) {
    return await cachedMaxSize
  }

  const promise = new Promise<Dimensions>((resolve, reject) => {
    canvasSize.maxArea({
      onSuccess: (width, height) =>
        resolve({
          width,
          height,
        }),
      onError: reject,
    })
  })
  cachedMaxSize = promise
  return await promise
}

function getFitScale(container: Dimensions, toTest: Dimensions) {
  return Math.min(
    container.width / toTest.width,
    container.height / toTest.height
  )
}

async function getPageImageAsBlob(page: pdfJsLib.PDFPageProxy): Promise<Blob> {
  const sourceViewport = page.getViewport({ scale: 1 })

  const scale = getFitScale(await getMaxCanvasSize(), sourceViewport)
  const viewport = page.getViewport({ scale: Math.min(scale, 3) })

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

export async function getPDFDocumentProxy(src: GetDocumentParam) {
  const loadingTask = pdfJsLib.getDocument(src)
  return await loadingTask.promise
}

export async function* getPDFPagesAsBlobs(
  documentData: pdfJsLib.PDFDocumentProxy
) {
  for (let pageNumber = 1; pageNumber <= documentData.numPages; pageNumber++) {
    let pageData: pdfJsLib.PDFPageProxy | null = null

    try {
      pageData = await documentData.getPage(pageNumber)
      yield await getPageImageAsBlob(pageData)
    } finally {
      if (pageData) {
        pageData.cleanup()
      }
    }
  }
}
