'use client';

import * as React from 'react';
import * as Aspect from '@radix-ui/react-aspect-ratio';

/** Minimal wrapper around `@radix-ui/react-aspect-ratio`. */
export default function AspectRatio({
  ratio,
  children,
  className,
}: {
  ratio: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Aspect.Root ratio={ratio} className={className}>
      {children}
    </Aspect.Root>
  );
}
