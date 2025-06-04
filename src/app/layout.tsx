// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ConvexClientProvider from './ConvexClientProvider';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/header';
import './globals.css';

/* ---------------- Fonts ---------------- */
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/* ------------- Metadata -------------- */
export const metadata: Metadata = {
  title: 'Cloudi-Agent',
  description:
    'Cloudi-Agent – an AI-powered Cloudinary assistant built with Next.js, Motion & Convex.',
};

/* ---------- Root Layout -------------- */
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
        {/* Provide Convex hooks to the whole tree */}
        <ConvexClientProvider>
          <Header />

          {/* Hero / intro */}
          <section className='max-w-4xl mx-auto px-4 py-8 text-center pt-12 xl:pt-24'>
            <p className='text-lg text-amber-800'>
              Upload, transform & manage images with the power of AI +
              Cloudinary
            </p>
          </section>

          {/* Routed pages (e.g. chat) */}
          {children}
          <Toaster richColors position='top-center' />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
