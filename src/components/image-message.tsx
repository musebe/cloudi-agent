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

  // Determine thumbnail height to preserve aspect ratio (fallback to square)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Thumbnail as trigger */}
      <DialogTrigger asChild>
        <div className='cursor-pointer rounded-lg border bg-gray-50 p-2 shadow-sm hover:bg-gray-100 w-44'>
          <Image
            src={data.url}
            alt='Transformed image thumbnail'
            width={thumbWidth}
            height={thumbHeight}
            className='rounded-md object-cover'
          />
        </div>
      </DialogTrigger>

      {/* Full‐size dialog content */}
      <DialogContent
        aria-describedby='full-image-description'
        className='max-w-3xl sm:max-w-4xl'
      >
        <DialogHeader>
          <DialogTitle>Transformed Image</DialogTitle>
          <DialogDescription id='full-image-description'>
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

        <DialogFooter className='flex flex-col gap-2'>
          {/* Copy URL button */}
          <Button
            onClick={handleCopy}
            size='sm'
            variant='outline'
            className='flex items-center gap-1 justify-center'
          >
            <ClipboardCopy className='h-4 w-4' />
            Copy Image URL
          </Button>

          {/* Close button */}
          <DialogClose asChild>
            <button className='mt-1 w-full rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700'>
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
