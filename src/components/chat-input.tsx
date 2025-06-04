'use client';

import { useCallback, memo } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import { UploadButton, UploadInfo } from '@/components/segments/UploadButton';

interface Props {
  /* text state */
  message: string;
  setMessage(value: string): void;
  sendMessage(): void;
  isLoading: boolean;
  error: string | null;

  /* suggestions */
  suggestions: string[] | null;
  onSelectSuggestion(value: string): void;
  onDismissSuggestions(): void;

  /* upload callback */
  onUploaded(info: UploadInfo): void;
}

/**
 * ChatInput is kept deliberately dumb—no business logic,
 * only UI state & callbacks—so it’s easy to reuse in other flows.
 */
function ChatInputComponent({
  message,
  setMessage,
  sendMessage,
  isLoading,
  error,
  suggestions,
  onSelectSuggestion,
  onDismissSuggestions,
  onUploaded,
}: Props) {
  /** ready == first image uploaded */
  const ready = suggestions !== null;

  /** stable wrapper preserves original ChatInput log */
  const handleUpload = useCallback(
    (info: UploadInfo) => {
      console.log('✅ uploaded from ChatInput:', info);
      onUploaded(info);
    },
    [onUploaded]
  );

  return (
    <div className='space-y-4'>
      {/* suggestion chips */}
      {ready && suggestions && (
        <div className='flex flex-wrap items-center gap-2'>
          {suggestions.map((s) => (
            <Button
              key={s}
              size='sm'
              variant='outline'
              onClick={() => onSelectSuggestion(s)}
            >
              {s}
            </Button>
          ))}
          <Button
            size='sm'
            variant='ghost'
            onClick={onDismissSuggestions}
            className='text-amber-700 hover:text-amber-900'
          >
            Type my own text
          </Button>
        </div>
      )}

      {/* textarea & controls */}
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
              sendMessage();
            }
          }}
        />

        {/* show until first upload */}
        {!ready && (
          <div className='absolute bottom-2 right-12'>
            <UploadButton onUpload={handleUpload} disabled={isLoading} />
          </div>
        )}

        {/* show after upload */}
        {ready && (
          <Button
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
            className='absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 p-0 text-white hover:bg-amber-700'
          >
            <Send className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* error banner */}
      {error && (
        <p className='rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600'>
          {error}
        </p>
      )}
    </div>
  );
}

/* Memo to avoid re-render storms when parent state changes */
export default memo(ChatInputComponent);
