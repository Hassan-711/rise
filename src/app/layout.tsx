import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'RiseOS — Personal OS for Builders',
    template: '%s | RiseOS',
  },
  description: 'Track your career, studies, tasks, and growth — all in one premium dashboard.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts via Google — Sora + JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
