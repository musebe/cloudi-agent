// components/demo-prompts.tsx
'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const DEMO_PROMPTS = [
  'Upload an image and auto-enhance it',
  'Remove the background of my product photo',
  'Give me three square (1:1) variations of this image',
  'Generate a URL that crops to a 16:9 hero banner',
  'Analyze this image and suggest ALT text',
];

export default function DemoPrompts({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className='flex flex-wrap gap-2 py-4'>
      {DEMO_PROMPTS.map((prompt) => (
        <Button
          key={prompt}
          variant={prompt === picked ? 'secondary' : 'outline'}
          size='sm'
          className='group flex items-center gap-1'
          onClick={() => {
            setPicked(prompt);
            onSelect(prompt);
          }}
        >
          <Sparkles className='h-4 w-4 shrink-0 text-amber-600 group-hover:text-amber-700' />
          {prompt}
        </Button>
      ))}
    </div>
  );
}
