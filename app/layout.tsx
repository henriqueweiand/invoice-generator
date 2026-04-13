import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = 'https://invoice-generator.pages.dev'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Invoice Generator — Create & Print Professional Invoices Free',
    template: '%s | Invoice Generator',
  },
  description:
    'Free browser-based invoice generator. Fill in your details, preview, and save as PDF instantly — no account, no backend, no data leaves your device.',
  keywords: [
    'invoice generator',
    'free invoice maker',
    'create invoice online',
    'invoice PDF',
    'print invoice',
    'freelance invoice',
    'professional invoice template',
  ],
  authors: [{ name: 'Henrique Weiand', url: BASE_URL }],
  creator: 'Henrique Weiand',

  // ── Canonical & indexing ──────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  // ── Open Graph (Facebook, LinkedIn, WhatsApp…) ────────────────
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Invoice Generator',
    title: 'Invoice Generator — Create & Print Professional Invoices Free',
    description:
      'Fill in your invoice details, preview the result, and save as PDF directly from the browser. No sign-up required.',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Invoice Generator — Create & Print Professional Invoices',
      },
    ],
  },

  // ── Twitter / X ───────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Invoice Generator — Create & Print Professional Invoices Free',
    description:
      'Fill in your invoice details, preview, and save as PDF — no account needed.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
