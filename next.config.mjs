/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Desabilita ESLint durante build apenas em produção (Vercel)
  // mas mantém em desenvolvimento local
  eslint: {
    ignoreDuringBuilds: process.env.VERCEL === '1',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
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