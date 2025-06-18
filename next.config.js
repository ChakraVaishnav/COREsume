/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // 'html2canvas': 'html2canvas-pro', // Removed alias
      };
    }
    return config;
  },
};

module.exports = nextConfig; 