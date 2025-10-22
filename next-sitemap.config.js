/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://coresume.in',
  generateRobotsTxt: true,
  exclude: [
    '/login',
    '/signup',
    '/forgot-password',
    '/change-password',
    '/dashboard',
    '/pricing',
    '/profile',
    '/resume-form',
    '/resume-preview',
    '/templates/*',
    '/api/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/signup',
          '/forgot-password',
          '/change-password',
          '/dashboard',
          '/pricing',
          '/profile',
          '/resume-form',
          '/resume-preview',
          '/templates',
          '/api',
        ],
      },
    ],
  },
};