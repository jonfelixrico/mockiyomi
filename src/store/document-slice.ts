import { createSlice } from '@reduxjs/toolkit'
import { ReducerActionHelper } from './store-utils'

export interface PageChangeData {
  previousPage: number
  timestamp: Date
  intent?: string
}

interface PageIndexWithIntent {
  intent?: string
  index: number
}

function isPageIndexWithIntent(a: unknown): a is PageIndexWithIntent {
  return !!a && typeof a === 'object' && 'index' in a
}

interface DocumentSlice {
  pageUrls: string[]
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
      { payload }: ReducerActionHelper<number | PageIndexWithIntent>
    ) {
      let newPageIndex: number
      let intent: string | undefined

      if (typeof payload === 'number') {
        newPageIndex = payload
        intent = undefined
      } else if (isPageIndexWithIntent(state)) {
        newPageIndex = payload.index
        intent = payload.intent
      } else {
        throw new Error('illegal arg')
      }

      state.pageChangeData = {
        previousPage: state.pageIndex,
        timestamp: new Date(),
        intent,
      }
      state.pageIndex = newPageIndex
    },
  },
})

export const documentActions = documentSlice.actions
export default documentSlice.reducer
