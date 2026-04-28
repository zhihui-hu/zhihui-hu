import { format } from 'date-fns';
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.huzhihui.com',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
};

const proxy = async () => {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/api/:path*',
    },
  ];
};

switch (process.env.NODE_ENV) {
  case 'production':
    nextConfig.output = 'export';

    break;
  case 'development':
    nextConfig.rewrites = proxy;
    break;
}

process.env.NEXT_PUBLIC_BUILD_TIME = format(new Date(), 'yyyy-MM-dd HH:mm');

export default nextConfig;
