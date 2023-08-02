import { configureStore } from '@reduxjs/toolkit'
import image from './image-slice'

export default configureStore({
  reducer: {
    image,
  },
})
