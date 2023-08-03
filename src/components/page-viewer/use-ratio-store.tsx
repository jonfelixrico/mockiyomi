import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { pageMetadataActions } from '@/store/page-metadata-slice'
import { useCallback } from 'react'

export default function useRatioStore(id: string) {
  const ratio = useAppSelector((state) => state.pageMetadata.ratios[id] ?? 1)

  const dispatch = useAppDispatch()
  const setRatio = useCallback(
    (ratio: number) => {
      dispatch(
        pageMetadataActions.setRatio({
          ratio,
          id,
        })
      )
    },
    [dispatch, id]
  )

  return {
    ratio,
    setRatio,
  }
}
