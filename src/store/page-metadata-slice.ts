import { createSlice } from '@reduxjs/toolkit'
import { ReducerActionHelper } from './store-utils'

interface PageMetadataSlice {
  ratios: Record<string, number>
}

interface SetRatioPayload {
  id: string
  ratio: number
}

const pageMetadataSlice = createSlice({
  name: 'pageMetadata',

  initialState: {
    ratios: {},
  } as PageMetadataSlice,

  reducers: {
    setRatio: (state, { payload }: ReducerActionHelper<SetRatioPayload>) => {
      state.ratios[payload.id] = payload.ratio
    },
  },
})

export const pageMetadataActions = pageMetadataSlice.actions
export default pageMetadataSlice.reducer
