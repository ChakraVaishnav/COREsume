/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://coresume.in',
  generateRobotsTxt: true,
  exclude: [
    '/login',
    '/signup',
    '/forgot-password',
    '/change-password',
    '/admin',
    '/admin/*',
    '/dashboard',
    '/dashboard/*',
    '/profile',
    '/resume-preview',
    '/resume-preview/*',
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
          '/admin',
          '/dashboard',
          '/profile',
          '/resume-preview',
          '/templates',
          '/api',
        ],
      },
    ],
  },
};