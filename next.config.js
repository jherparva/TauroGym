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
    // Forzar la resolución de tailwindcss
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": ".",
      tailwindcss: require.resolve("tailwindcss"),
    }
    return config
  },
}

module.exports = nextConfig
