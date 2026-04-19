/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfjs-dist', 'apify-client', 'pdf-parse', 'jobspy-js'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 