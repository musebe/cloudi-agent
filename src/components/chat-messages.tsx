// src/components/ChatMessages.tsx
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner'; // 🛎️ toast
import { Card, CardContent } from './ui/card';
import { HandHelping, HeartIcon, TextIcon, User, Bot } from 'lucide-react';
import ImageMessage from './image-message';
import TagPills from './TagPills'; // ← your new TagPills component
import { Message, ToolResult } from '@/types/chat';

export default function ChatMessages({
  msg,
  index,
}: {
  msg: Message;
  index: number;
}) {
  const isUser = msg.role === 'user';

  /* ─────────────── Dev logs ─────────────── */
  useEffect(() => {
    if (typeof msg.content === 'string') {
      console.log('💬 plain text', { index, text: msg.content });
    } else if (
      typeof msg.content === 'object' &&
      'type' in msg.content &&
      msg.content.type === 'image'
    ) {
      console.log('🖼️ image bubble', { index, from: msg.role });
    } else if (
      typeof msg.content === 'object' &&
      'toolResults' in msg.content
    ) {
      console.log('🛠️ tool-result', {
        index,
        type: (msg.content.toolResults as ToolResult).type,
      });
    }
  }, [msg, index]);

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* ── avatar ───────────────────────────────────────────────────────── */}
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          isUser ? 'bg-amber-100' : 'bg-blue-100'
        }`}
      >
        {isUser ? (
          <User className='h-5 w-5 text-amber-600' />
        ) : (
          <Bot className='h-5 w-5 text-blue-600' />
        )}
      </div>

      {/* ── bubble (inline-block so it shrink-wraps) ─────────────────────── */}
      <Card
        className={`inline-block max-w-[60%] ${
          isUser
            ? 'rounded-2xl rounded-tr-none bg-amber-50 text-gray-900'
            : 'rounded-2xl rounded-tl-none bg-white shadow-lg'
        }`}
      >
        <CardContent className='p-4'>
          {/* 1) Plain text */}
          {typeof msg.content === 'string' && (
            <p className='whitespace-pre-wrap text-gray-800'>{msg.content}</p>
          )}

          {/* 2) Image bubble */}
          {typeof msg.content === 'object' &&
            'type' in msg.content &&
            msg.content.type === 'image' && <ImageMessage data={msg.content} />}

          {/* 3) Tool‐result (analyze / email / social / tagList / generic) */}
          {typeof msg.content === 'object' &&
            'toolResults' in msg.content &&
            (() => {
              const r = msg.content.toolResults as ToolResult;

              // ── 3a) New: TagListToolResult ───────────────────────────────────
              if (r.type === 'tagList') {
                // `r` is now a TagListToolResult, so `r.tags` is guaranteed to exist
                const allTags: string[] = r.tags;
                const firstTen = allTags.slice(0, 10);

                return (
                  <div className='space-y-2'>
                    <h4 className='text-sm font-semibold text-gray-700'>
                      Auto‐Generated Tags:
                    </h4>
                    <TagPills tags={firstTen} />
                  </div>
                );
              }

              // ── 3b) Analyze ───────────────────────────────────────────────────
              if (r.type === 'analyze') {
                return (
                  <div className='space-y-6'>
                    <div className='text-base font-medium leading-relaxed text-gray-800'>
                      {r.formatted}
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <StatBox
                        icon={<HandHelping className='h-5 w-5' />}
                        title='Clarity'
                        value={r.clarity}
                        color='blue'
                      />
                      <StatBox
                        icon={<HeartIcon className='h-5 w-5' />}
                        title='Tone'
                        value={r.tone}
                        color='purple'
                      />
                      <StatBox
                        icon={<TextIcon className='h-5 w-5' />}
                        title='Grammar'
                        value={r.grammarIssues}
                        color='amber'
                      />
                    </div>
                    <div className='rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4'>
                      <h4 className='mb-2 font-semibold text-green-700'>
                        Rewritten Message
                      </h4>
                      <p className='whitespace-pre-wrap text-sm text-gray-600'>
                        {r.rewrittenMessage}
                      </p>
                    </div>
                  </div>
                );
              }

              // ── 3c) Email ─────────────────────────────────────────────────────
              if (r.type === 'email') {
                return (
                  <div className='space-y-4'>
                    <div className='rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4'>
                      <h4 className='mb-2 font-semibold text-blue-700'>
                        Email Details
                      </h4>
                      <p className='text-sm'>
                        <span className='font-medium'>To:</span> {r.recipient}
                      </p>
                      <p className='text-sm'>
                        <span className='font-medium'>Subject:</span>{' '}
                        {r.subject}
                      </p>
                    </div>
                    <div className='rounded-xl border bg-white p-4'>
                      <p className='whitespace-pre-wrap text-gray-800'>
                        {r.body}
                      </p>
                    </div>
                  </div>
                );
              }

              // ── 3d) Social ────────────────────────────────────────────────────
              if (r.type === 'social') {
                return (
                  <div className='space-y-4'>
                    <p className='font-medium text-gray-800'>
                      [{r.platform} post suggestion]
                    </p>
                    <p className='whitespace-pre-wrap text-gray-700'>
                      {r.message}
                    </p>
                  </div>
                );
              }

              // ── 3e) Generic “tool-result” ─────────────────────────────────────
              return (
                <div>
                  <p className='whitespace-pre-wrap text-xs text-gray-500'>
                    {JSON.stringify(r)}
                  </p>
                </div>
              );
            })()}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── helper for analyze stat boxes ────────────────────────────────────── */
function StatBox({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: 'blue' | 'purple' | 'amber';
}) {
  const colors: Record<typeof color, string> = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-700',
  };

  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${colors[color]}`}>
      <h4 className='mb-2 flex items-center gap-2 font-semibold'>
        {icon}
        {title}
      </h4>
      <p className='text-sm text-gray-600'>{value}</p>
    </div>
  );
}
