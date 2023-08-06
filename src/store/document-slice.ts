import { createSlice } from '@reduxjs/toolkit'
import { ReducerActionHelper } from './store-utils'

interface DocumentSlice {
  pageUrls: string[]
  pageIndex: number
}

const documentSlice = createSlice({
  name: 'document',

  initialState: {
    pageUrls: [],
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
