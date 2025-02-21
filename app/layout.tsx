import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '離職集點卡',
  description: '累積怒氣點數，集滿了就是你要前往下一站的時候',
  openGraph: {
    title: '離職集點卡',
    description: '累積怒氣點數，集滿了就是你要前往下一站的時候',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head />
      <body>{children}</body>
    </html>
  )
}
