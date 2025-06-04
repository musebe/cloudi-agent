'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { CldImage } from 'next-cloudinary';
import { ImageContent } from '@/types/chat';


export default function ImageMessage({ data }: { data: ImageContent }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <img
          src={data.url}
          className='h-28 w-auto cursor-pointer rounded-lg object-cover shadow-sm'
          alt='upload thumbnail'
        />
      </DialogTrigger>

      <DialogContent className='max-w-fit p-0'>
        <CldImage
          src={data.publicId}
          width={data.width}
          height={data.height}
          alt='full upload'
          className='rounded-lg'
        />
      </DialogContent>
    </Dialog>
  );
}
