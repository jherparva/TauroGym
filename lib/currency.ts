/**
 * Formatea un valor numérico a formato de moneda colombiana (COP)
 * @param value - Valor a formatear
 * @returns Cadena formateada como moneda colombiana
 */
export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea un valor numérico a formato de moneda
 * @param value - Valor a formatear
 * @param currency - Código de moneda (por defecto COP para pesos colombianos)
 * @returns Cadena formateada como moneda
 */
export function formatCurrency(value: number, currency = "COP"): string {
  // Configuración para pesos colombianos
  if (currency === "COP") {
    return formatCOP(value)
  }

  // Configuración para dólares (por si se necesita)
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  // Configuración por defecto
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea un valor numérico a formato de porcentaje
 * @param value - Valor a formatear (0.1 = 10%)
 * @returns Cadena formateada como porcentaje
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}
