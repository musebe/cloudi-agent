// components/header.tsx
'use client';

import Link from 'next/link';
import { ImageIcon, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className='sticky top-0 z-20 w-full shadow-md bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* ── Brand ─────────────────────────────────────────── */}
        <Link
          href='/'
          className='flex items-center gap-2 text-amber-800 hover:text-amber-900'
        >
          <span className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/90 shadow'>
            <ImageIcon className='h-5 w-5 text-white' />
          </span>
          <span className='bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-xl font-bold text-transparent'>
            Cloudi-Agent: Your AI Image Assistant
          </span>
        </Link>

        {/* ── Right-hand actions ────────────────────────────── */}
        <div className='flex items-center gap-3'>
          {/* placeholder “sparkle” action */}
          <Button
            size='sm'
            className='hidden sm:inline-flex bg-amber-600 hover:bg-amber-700 text-white'
          >
            <Sparkles className='mr-1 h-4 w-4' />
            Demo
          </Button>

          {/* in the future: ThemeSwitch, ProfileMenu, etc. */}
        </div>
      </div>
    </header>
  );
}
