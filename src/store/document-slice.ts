import { createSlice } from '@reduxjs/toolkit'
import { ReducerActionHelper } from './store-utils'

interface DocumentSlice {
  pageUrls: string[]
  pageIndex: number
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

    setPageIndx(state, { payload }: ReducerActionHelper<number>) {
      state.pageIndex = payload
    },
  },
})

export const documentActions = documentSlice.actions
export default documentSlice.reducer
