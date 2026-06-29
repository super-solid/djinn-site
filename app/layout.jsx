import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

export const metadata = {
  title: "DJINN — Your company brain",
  description: "Not a chatbot. Not a search tool. An agent that knows your company and ships work.",
  openGraph: {
    title: "DJINN — Your company brain",
    description: "Not a chatbot. Not a search tool. An agent that knows your company and ships work.",
    images: ["/djinn-mark.png"],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
