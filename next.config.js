/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desactivar la verificación de tipos durante la compilación
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    // Desactivar optimizaciones experimentales que pueden causar problemas
    optimizeCss: false,
    scrollRestoration: true,
  },
  // Corregido: eliminar webpack5 y corregir la configuración de webpack
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": ".",
    }

    // Eliminar reglas de CSS
    const oneOfRule = config.module.rules.find((rule) => typeof rule.oneOf === "object")
    if (oneOfRule) {
      oneOfRule.oneOf = oneOfRule.oneOf.filter((rule) => !rule.test || !rule.test.toString().includes("css"))
    }

    return config
  },
}

module.exports = nextConfig
