'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useAction } from 'convex/react';

import ChatInput from './chat-input';
import ChatMessages from './chat-messages';
import ImageMessage from './image-message';
import ThinkingCard from './thinking-card';

import type { UploadInfo } from '@/components/segments/UploadButton';
import { api } from '../../convex/_generated/api';
import {
  Message,
  ToolResult,
  ImageContent,
  isImageMessage,
} from '@/types/chat';

const SUGGESTIONS = ['Remove background', 'Auto-enhance', 'Square crop 1:1'];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* Convex action */
  const createThread = useAction(api.agent.createAgentAssistantThread);

  /* ------------ upload handler ------------ */
  const handleUploaded = useCallback((info: UploadInfo) => {
    const img: ImageContent = {
      type: 'image',
      publicId: info.publicId,
      url: info.url,
      width: info.width,
      height: info.height,
    };
    setMessages((prev) => [...prev, { role: 'user', content: img }]);
    setSuggestions(SUGGESTIONS);
  }, []);

  /* ------------ prompt sender ------------ */
  const sendPrompt = useCallback(
    (prompt: string) => {
      if (!prompt.trim()) return;

      setMessages((p) => [...p, { role: 'user', content: prompt }]);
      setMessage('');
      setSuggestions(null);
      setError(null);

      startTransition(async () => {
        try {
          const data = await createThread({
            prompt,
            threadId: threadId || undefined,
          });
          if (data.threadId) setThreadId(data.threadId);

          /* ---------------- THE IMPORTANT PART ----------------
           *  toolResults from the backend can be many shapes.
           *  We coerce them through `unknown` to our union. */
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
        } catch (err) {
          console.error(err);
          setError('Failed to get response.');
        }
      });
    },
    [createThread, threadId]
  );

  /* ------------ render ------------ */
  return (
    <div className='container mx-auto max-w-4xl space-y-6 p-4'>
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

      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={() => sendPrompt(message)}
        isLoading={isLoading}
        error={error}
        suggestions={suggestions}
        onSelectSuggestion={setMessage}
        onDismissSuggestions={() => setSuggestions(null)}
        onUploaded={handleUploaded}
      />
    </div>
  );
}
