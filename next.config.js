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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": ".",
    }
    return config
  },
  // Desactivar completamente el procesamiento de CSS
  webpack5: true,
  webpack: (config) => {
    const oneOfRule = config.module.rules.find((rule) => typeof rule.oneOf === "object")

    if (oneOfRule) {
      // Eliminar reglas de CSS
      oneOfRule.oneOf = oneOfRule.oneOf.filter((rule) => !rule.test || !rule.test.toString().includes("css"))
    }

    return config
  },
}

module.exports = nextConfig
