import StoreProvider from '@/store/provider'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { StyleProvider } from '@/client-wrappers/antd'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mockiyomi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreProvider>
      {/* StyleProvider is needed so that Tailwind and Ant can play nice. Ref: https://github.com/ant-design/ant-design/issues/38794#issuecomment-1328263957 */}
      <StyleProvider hashPriority="high">
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </StyleProvider>
    </StoreProvider>
  )
}
