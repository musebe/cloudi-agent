'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useAction, useMutation } from 'convex/react';

import ChatInput from './chat-input';
import ChatMessages from './chat-messages';
import ImageMessage from './image-message';
import ThinkingCard from './thinking-card';
import DemoPrompts from './demo-prompts'; // ✨ NEW

import type { UploadInfo } from '@/components/segments/UploadButton';
import { api } from '../../convex/_generated/api';
import {
  Message,
  ToolResult,
  ImageContent,
  isImageMessage,
} from '@/types/chat';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [latestImage, setLatestImage] = useState<ImageContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* Convex calls */
  const createThread = useAction(api.agent.createAgentAssistantThread);
  const saveImageMeta = useMutation(api.images.saveImageMeta);

  /* ---------- upload handler ---------- */
  const handleUploaded = useCallback(
    async (info: UploadInfo) => {
      console.log('🆕 user uploaded →', info.publicId);

      const img: ImageContent = { type: 'image', ...info };
      setMessages((p) => [...p, { role: 'user', content: img }]);
      setLatestImage(img);

      saveImageMeta(info).catch((e) =>
        console.warn('⚠️ failed to persist image', e)
      );
    },
    [saveImageMeta]
  );

  /* ---------- prompt sender ---------- */
  const sendPrompt = useCallback(
    (prompt: string) => {
      if (!prompt.trim()) return;
      console.log('📨 user prompt →', prompt);

      const contextPrompt = latestImage
        ? `${prompt}\n\n(use publicId ${latestImage.publicId})`
        : prompt;

      setMessages((p) => [...p, { role: 'user', content: prompt }]);
      setMessage('');
      setError(null);

      startTransition(async () => {
        try {
          const data = await createThread({
            prompt: contextPrompt,
            threadId: threadId || undefined,
          });
          if (data.threadId) setThreadId(data.threadId);

          let tool: ToolResult | null = null;
          if (data.toolResults) {
            const raw = Array.isArray(data.toolResults)
              ? data.toolResults[0]
              : data.toolResults;
            tool = raw as unknown as ToolResult;
          }

          setMessages((p) => [
            ...p,
            tool
              ? { role: 'assistant', content: { toolResults: tool } }
              : { role: 'assistant', content: data.text || '' },
          ]);

          if (tool && (tool as any).url) {
            console.log('🖼️  tool url →', (tool as any).url);
            const img: ImageContent = {
              type: 'image',
              publicId: 'generated',
              url: (tool as any).url,
              width: 0,
              height: 0,
            };
            setMessages((p) => [...p, { role: 'assistant', content: img }]);
          }
        } catch (err) {
          console.error('❌ agent error', err);
          toast.error('Failed to get response 😔', { icon: '⚠️' });
          setError('Failed to get response.');
        }
      });
    },
    [createThread, threadId, latestImage]
  );

  /* ---------- JSX ---------- */
  return (
    <div className='container mx-auto max-w-4xl space-y-6 p-4'>
      {/* chat history */}
      <div className='min-h-[460px] space-y-4 rounded-2xl border bg-gradient-to-b from-gray-50 to-white p-6 shadow-lg'>
        {messages.map((m, i) =>
          isImageMessage(m) ? (
            <ImageMessage key={i} data={m.content} />
          ) : (
            <ChatMessages key={i} msg={m} index={i} />
          )
        )}
        {isLoading && <ThinkingCard />}
        <div ref={endRef} />
      </div>

      {/* demo prompts appear AFTER first image */}
      {latestImage && (
        <DemoPrompts
          onSelect={(p) => {
            setMessage(p);
            sendPrompt(p);
          }}
        />
      )}

      {/* input */}
      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={() => sendPrompt(message)}
        isLoading={isLoading}
        error={error}
        hasImage={!!latestImage}
        onUploaded={handleUploaded}
      />
    </div>
  );
}
