import type React from "react"
import { ThemeProvider } from "../components/theme-provider"
import "./globals.css"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GitHub Repo Analyzer',
  description: 'Analyze GitHub repositories with detailed insights and visualizations',
  icons: {
    icon: '/github-6980894_640.webp',
    shortcut: '/github-6980894_640.webp',
    apple: '/github-6980894_640.webp'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
