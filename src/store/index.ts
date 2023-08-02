import { configureStore } from '@reduxjs/toolkit'
import pageMetadata from './page-metadata-slice'

export default configureStore({
  reducer: {
    pageMetadata,
  },
})
