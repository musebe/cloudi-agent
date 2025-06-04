// src/components/chat-input.tsx
'use client';

import { memo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import { UploadButton, UploadInfo } from '@/components/segments/UploadButton';

interface Props {
  message: string;
  setMessage(v: string): void;
  sendMessage(): void;
  isLoading: boolean;
  error: string | null;

  /** at least one image has been uploaded */
  hasImage: boolean;

  /** file-upload callback from <UploadButton> */
  onUploaded(info: UploadInfo): void;
}

/* ---------------- Component ---------------- */
function ChatInputComponent({
  message,
  setMessage,
  sendMessage,
  isLoading,
  error,
  hasImage,
  onUploaded,
}: Props) {
  const ready = hasImage; // textarea is unlocked once an image exists

  /* ---------- handlers with emoji logs ---------- */
  const handleUpload = useCallback(
    (info: UploadInfo) => {
      console.log('🖼️  upload complete →', info);
      onUploaded(info);
    },
    [onUploaded]
  );

  const handleSend = useCallback(() => {
    console.log('📤 sending prompt');
    sendMessage();
  }, [sendMessage]);

  /* ---------- toast errors ---------- */
  useEffect(() => {
    if (error) toast.error(error, { icon: '⚠️' });
  }, [error]);

  /* ---------- JSX ---------- */
  return (
    <div className='space-y-4'>
      {/* ➊ textarea + controls */}
      <div className='relative'>
        <Textarea
          placeholder={
            ready
              ? 'Describe the transformation you’d like…'
              : 'Upload an image first to begin'
          }
          disabled={!ready}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`min-h-[90px] resize-none pr-24 ${
            ready ? 'focus:ring-amber-500' : 'opacity-70'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {/* upload button – hide after first upload */}
        {!ready && (
          <div className='absolute bottom-2 right-12'>
            <UploadButton onUpload={handleUpload} disabled={isLoading} />
          </div>
        )}

        {/* send icon – only after upload */}
        {ready && (
          <Button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className='absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 p-0 text-white hover:bg-amber-700'
          >
            <Send className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(ChatInputComponent);
