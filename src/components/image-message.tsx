// src/components/image-message.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';
import { ImageContent } from '@/types/chat';

export default function ImageMessage({ data }: { data: ImageContent }) {
  const [open, setOpen] = useState(false);

  // Track thumbnail loading / error
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Fixed thumbnail width; preserve aspect ratio if possible
  const thumbWidth = 200;
  const thumbHeight =
    data.width && data.height
      ? Math.round((data.height / data.width) * thumbWidth)
      : 200;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(data.url)
      .then(() => {
        toast.success('Image URL copied to clipboard! 📋');
      })
      .catch((err) => {
        console.error('Copy failed', err);
        toast.error('Failed to copy URL 😔');
      });
  };

  const onThumbError = () => {
    // Cloudinary not ready? Show “Processing…” overlay instead of broken thumbnail
    setIsLoading(false);
    setHasError(true);
  };

  const onThumbLoad = () => {
    // Once the image loads, hide spinner/overlay
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ─────────────────────────────────────────────────────────────────────────────
          1) Thumbnail (always points at data.url). While loading: spinner; if 404: “Processing…”
         ───────────────────────────────────────────────────────────────────────────── */}
      <DialogTrigger asChild>
        <div className='relative inline-block w-[200px] cursor-pointer'>
          {/* a) Spinner overlay while loading */}
          {isLoading && (
            <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/60'>
              <div className='animate-spin h-6 w-6 rounded-full border-4 border-gray-300 border-t-gray-600'></div>
            </div>
          )}

          {/* b) “Processing…” overlay if the thumbnail fails (e.g. Cloudinary still generating) */}
          {hasError && (
            <div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-600'>
              Processing…
            </div>
          )}

          {/* c) Actual Next/Image for thumbnail (using data.url) */}
          {!hasError && (
            <Image
              src={data.url}
              alt='Transformed image thumbnail'
              width={thumbWidth}
              height={thumbHeight}
              className={`rounded-lg object-cover transition-opacity duration-200 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={onThumbLoad}
              onError={onThumbError}
              style={{ width: 'auto', height: 'auto' }}
            />
          )}

          {/* d) If in “error” mode, reserve the same space so layout doesn’t shift */}
          {hasError && (
            <div
              style={{
                width: thumbWidth,
                height: thumbHeight,
              }}
            />
          )}
        </div>
      </DialogTrigger>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2) Full‐size dialog content (no aria‐describedBy prop—Shadcn's DialogDescription handles ARIA)
         ───────────────────────────────────────────────────────────────────────────── */}
      <DialogContent className='max-w-3xl sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Transformed Image</DialogTitle>
          <DialogDescription>
            This dialog shows the full‐size transformed image. You can also copy
            its URL below.
          </DialogDescription>
        </DialogHeader>

        <div className='relative w-full aspect-[4/3] bg-black'>
          <Image
            src={data.url}
            alt='Full-size transformed'
            fill
            className='object-contain'
            sizes='(max-width: 640px) 100vw, 640px'
          />
        </div>

        <DialogFooter className='flex flex-col gap-2 mt-4'>
          <Button
            onClick={handleCopy}
            size='sm'
            variant='outline'
            className='flex items-center gap-1 justify-center'
          >
            <ClipboardCopy className='h-4 w-4' />
            Copy Image URL
          </Button>
          <DialogClose asChild>
            <button className='w-full rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700'>
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
