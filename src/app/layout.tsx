import type { Metadata, Viewport } from 'next';
import '@/index.css';

export const metadata: Metadata = {
  title: 'MyStyle AI — Personal Wardrobe & Fashion Stylist',
  description: 'Your Wardrobe. Your Style. Reimagined. Intelligent outfit recommendations crafted strictly from clothes you actually own.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#3B4D42',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen selection:bg-[#3B4D42] selection:text-white">
        {children}
      </body>
    </html>
  );
}
