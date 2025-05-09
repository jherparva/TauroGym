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
    removeConsole: false, // Cambiar a false para mantener los console.log en producción
  },
  experimental: {
    scrollRestoration: true,
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
  // Configuración de headers para CORS
  async headers() {
    return [
      {
        // Aplicar estos encabezados a todas las rutas API
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
}

module.exports = nextConfig
