import { createSlice } from '@reduxjs/toolkit'
import { ReducerActionHelper } from './store-utils'

interface ImageSlice {
  ratios: Record<string, number>
}

interface SetRatioPayload {
  id: string
  ratio: number
}

export const imageSlice = createSlice({
  name: 'image',

  initialState: {
    ratios: {},
  } as ImageSlice,

  reducers: {
    setRatio: (state, { payload }: ReducerActionHelper<SetRatioPayload>) => {
      state.ratios[payload.id] = payload.ratio
    },
  },
})

export const { setRatio } = imageSlice.actions

export default imageSlice.reducer
