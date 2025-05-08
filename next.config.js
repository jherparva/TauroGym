/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignorar completamente los errores de ESLint durante la compilación
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorar completamente los errores de TypeScript durante la compilación
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración para resolver problemas de importación
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
    scrollRestoration: true,
  },
  // Configuración adicional para resolver problemas de importación
  webpack: (config, { isServer }) => {
    // Configuración para resolver problemas de importación de componentes
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/components": "./components",
      "@/lib": "./lib",
    }

    return config
  },
}

module.exports = nextConfig
