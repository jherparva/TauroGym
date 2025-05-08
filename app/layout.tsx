import "../styles/globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import { Sidebar } from "../components/layout/sidebar"
import { SidebarProvider } from "../components/ui/sidebar"
import { LanguageProvider } from "../contexts/language-context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <LanguageProvider>
          <SidebarProvider>
            <div className="min-h-screen bg-background text-foreground">
              <div className="flex flex-col md:grid md:grid-cols-[auto_1fr]">
                <Sidebar />
                <main className="flex-1 p-4 md:p-6">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

export const metadata = {
  generator: "v0.dev",
}
