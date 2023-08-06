import { useCallback } from 'react'

export function usePinchPanClasses(className?: string) {
  const addClasses = useCallback(() => {
    document.body.classList.add('dragging')
    if (className) {
      document.body.classList.add(className)
    }
  }, [className])

  const removeClasses = useCallback(() => {
    document.body.classList.remove('dragging')
    if (className) {
      document.body.classList.remove(className)
    }
  }, [className])

  return {
    addClasses,
    removeClasses,
  }
}
