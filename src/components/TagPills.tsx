// src/components/TagPills.tsx
import React from 'react';

interface TagPillsProps {
  tags: string[];
}

export default function TagPills({ tags }: TagPillsProps) {
  // A simple array of Tailwind “pill” color schemes.
  const colorClasses = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-amber-100 text-amber-800',
    'bg-pink-100 text-pink-800',
    'bg-teal-100 text-teal-800',
    'bg-indigo-100 text-indigo-800',
    'bg-emerald-100 text-emerald-800',
    'bg-rose-100 text-rose-800',
    'bg-lime-100 text-lime-800',
  ];

  return (
    <div className='flex flex-wrap gap-2'>
      {tags.map((tag, idx) => {
        const classes = colorClasses[idx % colorClasses.length];
        return (
          <span
            key={idx}
            className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${classes}`}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}
