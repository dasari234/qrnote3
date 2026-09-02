'use client';

import type { ChatStatus } from 'ai';
import { Paperclip, Send } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { useChatApp } from '@/context/ai-chat-context';
import AttachmentPreview, { ChatAttachment } from './attachment-preview';

interface ChatConversation {
  id: string;
  title: string;
  modelId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatComposerProps {
  conversationId: string | null;

  sendMessage: (
    message: {
      text: string;
    },
    files?:
      | {
          type: 'file';
          url: string;
          mediaType: string;
          filename: string;
        }[]
      | undefined,
    options?: {
      body?: Record<string, unknown>;
    }
  ) => Promise<unknown>;

  status: ChatStatus;

  onConversationCreated?: (conversation: ChatConversation) => void;
}

export default function ChatComposer({
  conversationId,
  sendMessage,
  status,
  onConversationCreated,
}: ChatComposerProps) {
  const { modelId } = useChatApp();

  const [input, setInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);

  const [uploading, setUploading] = useState(false);

  const isLoading = status === 'submitted' || status === 'streaming';

  async function createConversation() {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation.');
    }

    const data = await response.json();

    if (!data.conversation?.id) {
      throw new Error('Invalid conversation response.');
    }

    return data.conversation as ChatConversation;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const text = input.trim();

    if (!text || isLoading || !modelId) {
      return;
    }

    /*
     * Clear immediately so Enter cannot submit
     * the same message twice.
     */
    setInput('');

    try {
      let activeConversationId = conversationId;

      /*
       * IMPORTANT:
       *
       * No conversation is created when
       * "New chat" is clicked.
       *
       * The first prompt creates it here.
       */
      if (!activeConversationId) {
        const conversation = await createConversation();

        activeConversationId = conversation.id;

        onConversationCreated?.(conversation);
      }

      /*
       * Send through the SAME useChat instance
       * that ChatMessageList is reading from.
       */
      await sendMessage(
        {
          text,
        },
        messageFiles.length ? messageFiles : undefined,
        {
          body: {
            modelId,
            conversationId: activeConversationId,
            attachmentIds: attachments.map((item) => item.id),
          },
        }
      );
    } catch (error) {
      console.error('Failed to submit message:', error);

      /*
       * Restore prompt if creation or
       * sending failed.
       */
      setInput(text);
    }
  }

  async function uploadFiles(files: FileList) {
    setUploading(true);

    try {
      const uploaded: ChatAttachment[] = [];

      for (let index = 0; index < files.length; index++) {
        const file = files.item(index);

        if (!file) {
          continue;
        }

        const formData = new FormData();

        formData.append('file', file);

        if (conversationId) {
          formData.append('conversationId', conversationId);
        }

        const response = await fetch('/api/ai/files', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error?.message ?? 'File upload failed.');
        }

        if (data.attachment) {
          uploaded.push(data.attachment);
        }
      }

      setAttachments((current) => [...current, ...uploaded]);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  }

  const messageFiles = attachments
    .filter((attachment) => attachment.url && attachment.status !== 'failed')
    .map((attachment) => ({
      type: 'file' as const,
      url: attachment.url!,
      mediaType: attachment.mimeType,
      filename: attachment.fileName,
    }));

  return (
    <div className="border-t bg-background">
      <form onSubmit={submit} className="mx-auto w-full max-w-4xl p-4">
        <div className="flex flex-col rounded-2xl border border-input bg-background shadow-sm p-1 focus-within:ring-1 focus-within:ring-ring">
          <AttachmentPreview
            attachments={attachments}
            onRemove={async (id) => {
              await fetch(`/api/ai/files/${id}`, {
                method: 'DELETE',
              });

              setAttachments((current) =>
                current.filter((item) => item.id !== id)
              );
            }}
          />
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                if (isLoading || !input.trim()) {
                  return;
                }

                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Message AI..."
            disabled={isLoading}
            className="min-h-[70px] resize-none border-0 shadow-none focus-visible:ring-0"
          />

          <div className="flex items-center justify-between p-2 pt-0">
            <div>
              <input
                ref={fileRef}
                type="file"
                hidden
                multiple
                accept="
    image/png,
    image/jpeg,
    image/webp,
    image/gif,
    application/pdf,
    text/plain,
    text/markdown,
    text/csv,
    application/json
  "
                onChange={(event) => {
                  if (event.target.files) {
                    void uploadFiles(event.target.files);
                  }

                  event.target.value = '';
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={isLoading || uploading}
                onClick={() => fileRef.current?.click()}
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8"
                disabled={isLoading || !input.trim() || !modelId}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </div>
  );
}
