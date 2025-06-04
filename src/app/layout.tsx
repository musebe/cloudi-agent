// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ConvexClientProvider from './ConvexClientProvider';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/header';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cloudi-Agent',
  description:
    'Cloudi-Agent – an AI-powered Cloudinary assistant built with Next.js, Motion & Convex.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Convex provider + Navbar */}
        <ConvexClientProvider>
          <Header />{' '}
          {/* <-- Assume this is a fixed-height header, e.g. height: 64px */}
          {/* Here is where our routed pages (including Chat) will render */}
          {children}
          {/* Global toaster */}
          <Toaster richColors position='top-center' />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
