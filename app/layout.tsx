import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { BotIdClient } from 'botid/client'
import './globals.css'
import { BottomDock } from '@/components/nav/BottomDock'
import { Toaster } from '@/components/ui/sonner'
import { getSiteUrl } from '@/lib/site'

const protectedRoutes = [
  { path: '/api/chat', method: 'POST' },
  { path: '/api/transcribe', method: 'POST' },
  { path: '/api/ingest-job', method: 'POST' },
  { path: '/api/leads', method: 'POST' },
]

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const SITE_NAME = 'Federico Ostan-Bazán — Portfolio'
const SITE_DESCRIPTION =
  'Conversational portfolio of Federico Ostan-Bazán — product designer building AI-native interfaces.'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: '%s — Federico Ostan-Bazán',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: 'website',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`light ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head suppressHydrationWarning>
        <BotIdClient protect={protectedRoutes} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a
          href="#section-ai"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip to content
        </a>
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <BottomDock />
        <Toaster />
      </body>
    </html>
  )
}
