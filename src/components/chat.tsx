// src/components/Chat.tsx
'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useAction, useMutation } from 'convex/react';

import ChatInput from './chat-input';
import ChatMessages from './chat-messages';
import ImageMessage from './image-message';
import ThinkingCard from './thinking-card';
import DemoPrompts from './demo-prompts'; // Demo buttons

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

  // Reference to scroll to the bottom of messages
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /** Convex actions **/
  const createThread = useAction(api.agent.createAgentAssistantThread);
  const saveImageMeta = useMutation(api.images.saveImageMeta);

  /** Handle user upload **/
  const handleUploaded = useCallback(
    async (info: UploadInfo) => {
      console.log('🆕 user uploaded →', info.publicId);
      const img: ImageContent = { type: 'image', ...info };
      // Show the uploaded image immediately
      setMessages((prev) => [...prev, { role: 'user', content: img }]);
      setLatestImage(img);

      // Persist metadata (fire & forget)
      saveImageMeta(info).catch((e) =>
        console.warn('⚠️ failed to persist image', e)
      );
    },
    [saveImageMeta]
  );

  /** Send prompt to AI **/
  const sendPrompt = useCallback(
    (prompt: string) => {
      if (!prompt.trim()) return;
      console.log('📨 user prompt →', prompt);

      // If we have an image, prepend context so the AI knows which publicId to transform
      const contextPrompt = latestImage
        ? `${prompt}\n\n(use publicId ${latestImage.publicId})`
        : prompt;

      // Show user text immediately
      setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
      setMessage('');
      setError(null);

      startTransition(async () => {
        try {
          const data = await createThread({
            prompt: contextPrompt,
            threadId: threadId ?? undefined,
          });
          if (data.threadId) {
            setThreadId(data.threadId);
          }

          // Normalize the returned toolResults
          let tool: ToolResult | null = null;
          if (data.toolResults) {
            const raw = Array.isArray(data.toolResults)
              ? data.toolResults[0]
              : data.toolResults;
            tool = raw as unknown as ToolResult;
          }

          // ── Handle a Cloudinary URL result specially ──────────────────────────────────────────
          if (tool && (tool as any).type === 'cloudinaryUrl') {
            const url = (tool as any).url as string;
            console.log('🖼️  tool url →', url);

            // 1) Show exactly one ImageMessage bubble
            const imgMsg: ImageContent = {
              type: 'image',
              publicId: 'generated',
              url,
              width: 0,
              height: 0,
            };
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: imgMsg },
            ]);

            // 2) Extract the transformation segment from the URL
            //    e.g. https://res.cloudinary.com/hackit-africa/image/upload/
            //         c_fill,g_auto,w_1080,h_1080,f_webp/
            //         ai-agent/...
            const afterUpload = url.split('/upload/')[1] || '';
            const transformationSegment = afterUpload.split('/')[0] || '';
            const steps = transformationSegment
              .split(',')
              .map((part) => `• \`${part}\``)
              .join('\n');

            // 3) Build a short explanation
            const explanation = `
✨ **Image Update Details:** ✨  
Below are the steps used to achieve the requested change:  
${steps}

Your image is now ready with improved compression and quality! 👍
            `.trim();

            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: explanation },
            ]);

            return; // Skip the “normal” branch below
          }

          // ── If not a Cloudinary URL, fallback to normal assistant response ─────────────────────
          setMessages((prev) => [
            ...prev,
            tool
              ? { role: 'assistant', content: { toolResults: tool } }
              : { role: 'assistant', content: data.text ?? '' },
          ]);
        } catch (err) {
          console.error('❌ agent error', err);
          toast.error('Failed to get response 😔', { icon: '⚠️' });
          setError('Failed to get response.');
        }
      });
    },
    [createThread, threadId, latestImage]
  );

  /* ── Rendering ─────────────────────────────────────────────────────────────────────────── */
  return (
    // 1) We want this container to fill the remaining viewport (minus the 64px header).
    // 2) Inside it, the “message list” region is flex-1 and scrollable.
    // 3) The DemoPrompts and ChatInput remain pinned at the bottom.
    <div
      className='
        flex flex-col
        h-[calc(100vh-64px)]   /* 64px matches your Header height */
        max-w-4xl
        mx-auto
        space-y-4
        p-4
      '
    >
      {/* ── 1) Messages area: flex-1 to grow, overflow-y-auto so it scrolls internally ── */}
      <div
        className='
          flex-1
          overflow-y-auto
          space-y-4
          rounded-2xl
          border
          bg-gradient-to-b from-gray-50 to-white
          p-6
          shadow-lg
        '
      >
        {messages.map((m, i) =>
          isImageMessage(m) ? (
            <ImageMessage key={i} data={m.content} />
          ) : (
            <ChatMessages key={i} msg={m} index={i} />
          )
        )}
        {isLoading && <ThinkingCard />}

        {/* Scroll to bottom anchor */}
        <div ref={endRef} />
      </div>

      {/* ── 2) Demo Prompt Buttons (only once an image exists) ─────────────────────────────── */}
      {latestImage && (
        <DemoPrompts
          onSelect={(p) => {
            setMessage(p);
            sendPrompt(p);
          }}
        />
      )}

      {/* ── 3) ChatInput always pinned at bottom ───────────────────────────────────────────── */}
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
