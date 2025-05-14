
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // For multi-language support with next-intl or similar,
  // you would typically configure i18n routing here.
  // Example (specific to next-intl, actual setup might vary):
  // i18n: {
  //   locales: ['en', 'es'], // Add all supported locales
  //   defaultLocale: 'en',
  // },
};

export default nextConfig;
