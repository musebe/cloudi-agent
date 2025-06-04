// src/components/chat-messages.tsx
'use client';

import { Card, CardContent } from './ui/card';
import { HandHelping, HeartIcon, TextIcon, User, Bot } from 'lucide-react';
import ImageMessage from './image-message';
import { Message } from '@/types/chat';


export default function ChatMessages({ msg }: { msg: Message; index: number }) {
  const isUser = msg.role === 'user';

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* avatar */}
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

      {/* bubble */}
      <Card
        className={`max-w-[80%] ${
          isUser
            ? 'bg-amber-50 text-gray-900 rounded-2xl rounded-tr-none'
            : 'bg-white shadow-lg rounded-2xl rounded-tl-none'
        }`}
      >
        <CardContent className='p-4'>
          {/* 1. plain string message */}
          {typeof msg.content === 'string' && (
            <p className='whitespace-pre-wrap text-gray-800'>{msg.content}</p>
          )}

          {/* 2. image bubble */}
          {typeof msg.content === 'object' &&
            'type' in msg.content &&
            msg.content.type === 'image' && <ImageMessage data={msg.content} />}

          {/* 3. tool-result bubble */}
          {typeof msg.content === 'object' &&
            'toolResults' in msg.content &&
            (() => {
              const r = msg.content.toolResults;

              if (r.type === 'analyze') {
                return (
                  <div className='space-y-6'>
                    <div className='text-base font-medium text-gray-800 leading-relaxed'>
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

              /* fallback render */
              return (
                <p className='whitespace-pre-wrap text-xs text-gray-500'>
                  {JSON.stringify(r)}
                </p>
              );
            })()}
        </CardContent>
      </Card>
    </div>
  );
}

/* small helper for analyze boxes */
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
      <h4 className={`mb-2 flex items-center gap-2 font-semibold`}>
        {icon}
        {title}
      </h4>
      <p className='text-sm text-gray-600'>{value}</p>
    </div>
  );
}
