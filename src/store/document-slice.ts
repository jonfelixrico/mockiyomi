import { createSlice } from '@reduxjs/toolkit'
import { ReducerActionHelper } from './store-utils'

export interface PageChangeData {
  previousPage: number
  timestamp: number
  intent?: string
}

interface PageIndexWithIntent {
  intent?: string
  index: number
}

export type ChangePageIndexPayload = number | PageIndexWithIntent

function isPageIndexWithIntent(a: unknown): a is PageIndexWithIntent {
  return !!a && typeof a === 'object' && 'index' in a
}

interface DocumentSlice {
  pageUrls: string[]

  // TODO consider moving out navigation-related state to another slice
  pageIndex: number
  pageChangeData?: PageChangeData
}

const INITIAL_URLS = new Array(8)
  .fill(null)
  .map((_, index) => `/placeholder/${index + 1}.jpg`)

const documentSlice = createSlice({
  name: 'document',

  initialState: {
    pageUrls: INITIAL_URLS,
    pageIndex: 0,
  } as DocumentSlice,

  reducers: {
    setPageUrls(state, { payload }: ReducerActionHelper<string[]>) {
      state.pageUrls = payload
    },

    setPageIndex(
      state,
      { payload }: ReducerActionHelper<ChangePageIndexPayload>
    ) {
      let newPageIndex: number
      let intent: string | undefined

      if (typeof payload === 'number') {
        newPageIndex = payload
        intent = undefined
      } else if (isPageIndexWithIntent(payload)) {
        newPageIndex = payload.index
        intent = payload.intent
      } else {
        throw new Error('illegal arg')
      }

      state.pageChangeData = {
        previousPage: state.pageIndex,
        timestamp: Date.now(),
        intent,
      }
      state.pageIndex = newPageIndex
    },

    updatePageUrls(state, { payload }: ReducerActionHelper<string[]>) {
      state.pageChangeData = undefined
      state.pageIndex = 0
      state.pageUrls = payload
    },
  },
})

export const documentActions = documentSlice.actions
export default documentSlice.reducer
