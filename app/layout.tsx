// Eliminar completamente la importación de CSS
import type React from "react"
import { Sidebar } from "../components/layout/sidebar"
import { SidebarProvider } from "../components/ui/sidebar"
import { LanguageProvider } from "../contexts/language-context"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            background-color: white;
            color: black;
          }
          .min-h-screen { min-height: 100vh; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .flex-1 { flex: 1; }
          .p-4 { padding: 1rem; }
          @media (min-width: 768px) {
            .md\\:grid { display: grid; }
            .md\\:grid-cols-\\[auto_1fr\\] { grid-template-columns: auto 1fr; }
            .md\\:p-6 { padding: 1.5rem; }
          }
        `,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <SidebarProvider>
            <div className="min-h-screen">
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
