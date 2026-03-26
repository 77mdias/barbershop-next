/** @type {import('next').NextConfig} */
const allowUnsafeBuildBypass = process.env.ALLOW_UNSAFE_BUILD === "1";
const disableCspHeader = process.env.DISABLE_CSP_HEADER === "1";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss:",
  "form-action 'self'",
].join("; ");

const defaultSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ...(disableCspHeader ? [] : [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]),
];

const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: allowUnsafeBuildBypass,
  },
  typescript: {
    ignoreBuildErrors: allowUnsafeBuildBypass,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  outputFileTracingExcludes: {
    // Excluir apenas das serverless functions, não do build local
    "app/api/upload/**": [
      "node_modules/@img/**/*",
      "node_modules/sharp/**/*",
      ".next/cache/**/*",
      "node_modules/@swc/**/*",
      "public/images/cortes/**/*",
    ],
  },
  // Otimizações para reduzir tamanho das functions
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir Sharp completamente
      config.externals = [...(config.externals || []), "sharp"];

      // Excluir dependências pesadas
      config.externals.push({
        "@img/sharp-libvips-linuxmusl-x64": "commonjs @img/sharp-libvips-linuxmusl-x64",
        "@img/sharp-libvips-linux-x64": "commonjs @img/sharp-libvips-linux-x64",
        sharp: "commonjs sharp",
      });
    }
    return config;
  },
  // Força páginas de erro a serem dinâmicas
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: defaultSecurityHeaders,
      },
      {
        source: "/api/webhooks",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
