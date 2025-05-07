//C:\Users\jhon\Downloads\tauroGYM1\contexts\language-context.tsx

"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type LanguageContextType = {
  language: "es" | "en"
  setLanguage: (language: "es" | "en") => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<"es" | "en">("es")

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
