import { Providers } from '@/components/providers';
import { StructuredData } from '@/components/structured-data';
import { StyledJsxRegistry } from '@/components/styled-jsx-registry';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';

import pkg from '../../package.json';
import './globals.css';

const font = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: pkg.seo.title,
  description: pkg.seo.description,
  applicationName: pkg.seo.siteName,
  keywords: pkg.seo.keywords,
  authors: [pkg.seo.author],
  creator: pkg.seo.creator,
  publisher: pkg.seo.publisher,
  category: pkg.seo.category,
  alternates: {
    canonical: pkg.seo.og.url,
  },
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: pkg.seo.og.title,
    description: pkg.seo.og.description,
    url: pkg.seo.og.url,
    siteName: pkg.seo.og.siteName,
    locale: pkg.seo.og.locale,
    type: pkg.seo.og.type as 'website',
    images: [
      {
        url: pkg.seo.og.image,
        alt: pkg.seo.og.title,
      },
    ],
  },
  twitter: {
    card: pkg.seo.twitter.card as 'summary_large_image',
    title: pkg.seo.twitter.title,
    description: pkg.seo.twitter.description,
    images: [
      {
        url: pkg.seo.twitter.image,
        alt: pkg.seo.twitter.title,
      },
    ],
  },
  metadataBase: new URL(pkg.seo.og.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="renderer" content="webkit" />
        <meta
          name="theme-color"
          content="#FFFFFF"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#000000"
          media="(prefers-color-scheme: dark)"
        />
        {pkg.seo.jsonLd && (
          <StructuredData data={pkg.seo.jsonLd} id="huzhihui-jsonld" />
        )}
        <Script id="legacy-ie-redirect" strategy="beforeInteractive">
          {`
            (function() {
              var isIE = /MSIE|Trident/.test(navigator.userAgent);
              var isOldIE = /MSIE [1-9]\\.|MSIE 10\\./.test(navigator.userAgent);
              if (isOldIE) {
                window.location.href = '/ie.html';
              }
            })();
          `}
        </Script>
      </head>
      <body className={font.className} suppressHydrationWarning>
        <StyledJsxRegistry>
          <Providers>{children}</Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
