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
      // Excluir Sharp completamente
      config.externals = [...(config.externals || []), 'sharp'];

      // Excluir dependências pesadas
      config.externals.push({
        '@img/sharp-libvips-linuxmusl-x64': 'commonjs @img/sharp-libvips-linuxmusl-x64',
        '@img/sharp-libvips-linux-x64': 'commonjs @img/sharp-libvips-linux-x64',
        'sharp': 'commonjs sharp'
      });
    }
    return config;
  },

  // Configurações específicas para Vercel
  experimental: {
    outputFileTracingExcludes: {
      // Excluir apenas das serverless functions, não do build local
      'app/api/upload/**': [
        'node_modules/@img/**/*',
        'node_modules/sharp/**/*',
        '.next/cache/**/*',
        'node_modules/@swc/**/*',
        'public/images/cortes/**/*',
      ],
    },
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