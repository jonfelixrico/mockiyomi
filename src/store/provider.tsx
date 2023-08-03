'use client'

import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'

export default function StoreProvider(props: { children?: ReactNode }) {
  return <Provider store={store}>{props.children}</Provider>
}
