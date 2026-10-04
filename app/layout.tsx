import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BLOCK 6th | 口コミ作成サポート',
  description:
    'BLOCK 6th にご来店いただいたお客様が、実際の体験をもとに口コミ文章を作成できるサポートページです。',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'BLOCK 6th | 口コミ作成サポート',
    description: 'ご来店ありがとうございました。今日の感想を自然な口コミ文章にできます。',
    type: 'website',
    locale: 'ja_JP',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-ink-950 text-[#f5f3ef]">
        {children}
      </body>
    </html>
  );
}
