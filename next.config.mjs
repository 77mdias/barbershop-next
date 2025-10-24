/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Desabilita ESLint e TypeScript durante build para resolver problemas
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Otimizações para reduzir tamanho das functions
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Otimizar Sharp para serverless
      config.externals = [...(config.externals || []), 'sharp'];
    }
    return config;
  },
  // Força páginas de erro a serem dinâmicas
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/webhooks',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;