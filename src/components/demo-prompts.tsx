// src/components/demo-prompts.tsx
'use client';

import { JSX, useState } from 'react';
import {
  Sparkles,
  Wand2,
  Crop,
  Image as ImageIcon,
  RefreshCcw,
  Tags,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type Demo = { label: string; icon: JSX.Element };

const DEMO_PROMPTS: Demo[] = [
  {
    label: '🖼️ Auto-enhance this image',
    icon: <Wand2 className='h-4 w-4 shrink-0 text-amber-600' />,
  },
  {
    label: '🎯 Resize to 1080×1080 square',
    icon: <Crop className='h-4 w-4 shrink-0 text-blue-600' />,
  },
  {
    label: '🪄 Remove background cleanly',
    icon: <ImageIcon className='h-4 w-4 shrink-0 text-purple-600' />,
  },
  {
    label: '🔄 Convert to WebP format',
    icon: <RefreshCcw className='h-4 w-4 shrink-0 text-green-600' />,
  },
  {
    label: '🏷️ Tag and classify this image',
    icon: <Tags className='h-4 w-4 shrink-0 text-orange-600' />,
  },
  {
    label: '✨ Generative Fill: fill missing areas',
    icon: <Sparkles className='h-4 w-4 shrink-0 text-pink-500' />,
  },
  {
    label: '🌄 Generative Background Replace',
    icon: <Sparkles className='h-4 w-4 shrink-0 text-indigo-500' />,
  },
  {
    label: '🌈 Generative Recolor',
    icon: <Sparkles className='h-4 w-4 shrink-0 text-fuchsia-500' />,
  },
  {
    label: '❌ Generative Remove: remove an object',
    icon: <Sparkles className='h-4 w-4 shrink-0 text-red-500' />,
  },
  {
    label: '🔄 Generative Replace: swap an object',
    icon: <Sparkles className='h-4 w-4 shrink-0 text-teal-500' />,
  },
  {
    label: '🛠️ Generative Restore: restore image quality',
    icon: <Sparkles className='h-4 w-4 shrink-0 text-yellow-500' />,
  },
];

export default function DemoPrompts({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className='space-y-3 py-4'>
      <Badge variant='secondary' className='px-2 py-1 text-xs'>
        Try a one-click prompt
      </Badge>

      <div className='flex flex-wrap gap-2'>
        {DEMO_PROMPTS.map(({ label, icon }) => (
          <Button
            key={label}
            variant={label === picked ? 'secondary' : 'outline'}
            size='sm'
            className='group flex items-center gap-1'
            onClick={() => {
              console.log('🎯 demo prompt picked →', label);
              setPicked(label);
              onSelect(label);
            }}
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
