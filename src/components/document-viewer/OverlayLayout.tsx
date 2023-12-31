import { Dimensions } from '@/types/dimensions.interface'
import { Dispatch, ReactNode, useCallback, SetStateAction } from 'react'
import classnames from 'classnames'
import ConditionallyRender from '../common/ConditionallyRender'

export default function OverlayLayout({
  showOverlay,
  setShowOverlay,
  topChildren,
  bottomChildren,
  dimensions,
  children,
}: {
  dimensions: Dimensions
  children?: ReactNode

  showOverlay: boolean
  setShowOverlay: Dispatch<SetStateAction<boolean>>

  topChildren?: ReactNode
  bottomChildren?: ReactNode
}) {
  const toggleOverlay = useCallback(() => {
    setShowOverlay((showOverlay) => !showOverlay)
  }, [setShowOverlay])

  return (
    <div className="relative" style={dimensions}>
      <div className="absolute h-full w-full flex flex-col items-stretch z-10 pointer-events-none">
        <ConditionallyRender render={!!topChildren}>
          <div
            className={classnames(
              'px-5 py-3 bg-white border-b border-gray-300 transition-transform',
              {
                'pointer-events-auto': showOverlay,
              }
            )}
            style={{
              transform: `translateY(${showOverlay ? 0 : -100}%)`,
            }}
          >
            {topChildren}
          </div>
        </ConditionallyRender>

        <div className="grow" />

        <ConditionallyRender render={!!bottomChildren}>
          <div
            className={classnames(
              'px-5 py-3 bg-white border-t border-gray-300 transition-transform',
              {
                'pointer-events-auto': showOverlay,
              }
            )}
            style={{
              transform: `translateY(${showOverlay ? 0 : 100}%)`,
            }}
          >
            {bottomChildren}
          </div>
        </ConditionallyRender>
      </div>

      {/* Clicking on the content will toggle showing of the overlay */}
      <div onClick={toggleOverlay}>{children}</div>
    </div>
  )
}
