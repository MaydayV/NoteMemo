/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 在客户端打包时提供这些Node.js核心模块的polyfill
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'child_process': false,
        'fs': false,
        'fs/promises': false,
        'net': false,
        'tls': false,
        'dns': false,
        'timers/promises': false,
      };
    }
    return config;
  },
  // 开发环境的环境变量
  env: {
    ACCESS_CODE: '123456',
    ACCESS_CODES: '123456,654321,111111',
    ENABLE_SYNC: 'true',
    IS_DEV: process.env.NODE_ENV === 'development' ? 'true' : 'false',
  },
};

module.exports = nextConfig; 