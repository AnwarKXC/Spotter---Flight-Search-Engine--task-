import type { Metadata, Viewport } from "next"
import "./globals.css"
import ThemeRegistry from "./theme/ThemeRegistry"

export const metadata: Metadata = {
  title: {
    default: "Flight Search Engine - Find & Compare Flights",
    template: "%s | Flight Search Engine",
  },
  description: "Search and compare flights with real-time pricing. Find the best deals from top airlines with our accessible, easy-to-use flight search tool.",
  keywords: [ "flights", "flight search", "airline tickets", "travel", "compare flights", "cheap flights" ],
  authors: [ { name: "Flight Search Engine Team" } ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Flight Search Engine",
    title: "Flight Search Engine - Find & Compare Flights",
    description: "Search and compare flights with real-time pricing from top airlines.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flight Search Engine - Find & Compare Flights",
    description: "Search and compare flights with real-time pricing from top airlines.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1976d2" },
    { media: "(prefers-color-scheme: dark)", color: "#90caf9" },
  ],
}

export default function RootLayout ( {
  children,
}: Readonly<{
  children: React.ReactNode
}> ) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased">
        <ThemeRegistry>{ children }</ThemeRegistry>
      </body>
    </html>
  )
}
