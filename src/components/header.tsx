// components/header.tsx
'use client';

import Link from 'next/link';
import { BrainCog, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className='sticky top-0 z-20 w-full shadow-md bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-100'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* ── Brand ─────────────────────────────────────────── */}
        <Link
          href='/'
          className='flex items-center gap-2 text-indigo-800 hover:text-indigo-900'
        >
          <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow'>
            <BrainCog className='h-5 w-5 text-white' />
          </span>
          <span className='bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-xl font-bold text-transparent'>
            AI Image Agent
          </span>
        </Link>

        {/* ── Right-hand actions ────────────────────────────── */}
        <div className='flex items-center gap-4'>
          <Link
            href='/about'
            className='text-sm font-medium text-indigo-800 hover:text-indigo-900 transition'
          >
            About
          </Link>

        </div>
      </div>
    </header>
  );
}
