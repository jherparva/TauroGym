/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Eliminamos output: 'export' para permitir API routes y despliegue en Vercel

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

  // CONFIGURACIÓN CLAVE: Headers para CORS
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ]
  },

  // Configuración adicional para resolver problemas de importación
  webpack: (config, { isServer }) => {
    // Configuración para resolver problemas de importación de componentes
    config.resolve.alias = {
      ...config.resolve.alias,
    }

    return config
  },
  // Asegurarse de que los estilos se carguen correctamente
  poweredByHeader: false,
  swcMinify: true,
}

module.exports = nextConfig
