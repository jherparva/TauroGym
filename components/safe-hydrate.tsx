"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface SafeHydrateProps {
  children: React.ReactNode
}

export function SafeHydrate({ children }: SafeHydrateProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Renderizar un div vacío durante la hidratación inicial
  if (!isClient) {
    return <div style={{ visibility: "hidden" }} />
  }

  return <>{children}</>
}
