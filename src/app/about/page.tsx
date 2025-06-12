// src/app/about/page.tsx
'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  {
    title: 'Conversational Editing',
    description:
      'Use natural language to resize, remove backgrounds, or generate variants without manual UI controls.',
  },
  {
    title: 'Claude Tool-Use API',
    description:
      'Anthropic’s Claude 3 Sonnet interprets prompts and calls structured tools on your behalf.',
  },
  {
    title: 'Cloudinary URL Transforms',
    description:
      'Transformations like `c_fill`, `e_bgremoval`, and `e_gen_fill` are applied on-the-fly via Cloudinary URLs.',
  },
  {
    title: 'View Transitions UI',
    description:
      'Smooth bubble-to-bubble animations make the chat feel responsive, polished, and interactive.',
  },
];

export default function AboutPage() {
  return (
    <main className='container mx-auto px-6 py-16 space-y-16'>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='text-center space-y-4'
      >
        <h1 className='text-4xl font-extrabold'>
          Cloudi-Agent: AI Chat for Image Transformation
        </h1>
        <p className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
          A next-gen image assistant powered by Claude, Cloudinary, and Convex —
          upload an image, describe what you want, and receive an optimized
          result instantly.
        </p>
        <div className='mx-auto w-full max-w-xl overflow-hidden rounded-2xl shadow-lg'>
          <Image
            src='/preview.png'
            alt='Cloudi-Agent Demo Preview'
            width={1200}
            height={600}
            priority
            className='object-cover'
          />
        </div>
      </motion.section>

      {/* Features */}
      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
        {FEATURES.map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card className='h-full hover:shadow-xl transition-shadow'>
              <CardHeader>
                <CardTitle>{feat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feat.description}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Tech Stack */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='space-y-4'
      >
        <h2 className='text-2xl font-bold'>Built With</h2>
        <div className='flex flex-wrap gap-4'>
          <Badge variant='outline'>Next.js 15</Badge>
          <Badge variant='outline'>React 19</Badge>
          <Badge variant='outline'>Tailwind CSS 4</Badge>
          <Badge variant='outline'>shadcn/ui</Badge>
          <Badge variant='outline'>Convex</Badge>
          <Badge variant='outline'>Cloudinary</Badge>
          <Badge variant='outline'>Anthropic Claude</Badge>
        </div>
      </motion.section>
    </main>
  );
}
