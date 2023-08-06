import { configureStore } from '@reduxjs/toolkit'
import pageMetadata from './page-metadata-slice'
import document from './document-slice'

export const store = configureStore({
  reducer: {
    pageMetadata,
    document,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
