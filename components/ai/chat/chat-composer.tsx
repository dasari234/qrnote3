'use client';

import type { ChatRequestOptions, ChatStatus, FileUIPart } from 'ai';

import { Paperclip, Send } from 'lucide-react';

import { useRef, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { useChatApp } from '@/context/ai-chat-context';

import AttachmentPreview, { type ChatAttachment } from './attachment-preview';
import { ChatConversation } from './chat-types';

interface ChatComposerProps {
  conversationId: string | null;

  sendMessage: (
    message: {
      text: string;
      files?: FileUIPart[] | FileList;
    },
    options?: ChatRequestOptions
  ) => Promise<unknown>;

  status: ChatStatus;

  onConversationCreated?: (conversation: ChatConversation) => void;

  onConversationUpdated?: (conversationId: string) => void;
}

function isSuccessfulAttachment(attachment: ChatAttachment) {
  return attachment.status !== 'failed' && attachment.status !== 'processing';
}

export default function ChatComposer({
  conversationId,
  sendMessage,
  status,
  onConversationCreated,
  onConversationUpdated,
}: ChatComposerProps) {
  const { modelId } = useChatApp();

  const [input, setInput] = useState('');

  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);

  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  const canSubmit =
    Boolean(input.trim()) && Boolean(modelId) && !isLoading && !uploading;

  async function createConversation() {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let message = 'Failed to create conversation.';

      try {
        const data = await response.json();

        message = data?.error?.message ?? message;
      } catch {
        // Ignore invalid error payload.
      }

      throw new Error(message);
    }

    const data = await response.json();

    if (!data.conversation?.id) {
      throw new Error('Invalid conversation response.');
    }

    return data.conversation as ChatConversation;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();

    if (!canSubmit || !text) {
      return;
    }

    /*
     * Keep a copy so we can restore the
     * input if anything fails.
     */
    setInput('');

    try {
      let activeConversationId = conversationId;

      /*
       * IMPORTANT:
       *
       * Clicking "New chat" does not create
       * anything in the database anymore.
       *
       * The first prompt creates it here.
       */
      if (!activeConversationId) {
        const conversation = await createConversation();

        activeConversationId = conversation.id;

        onConversationCreated?.(conversation);
      }

      const validAttachments = attachments.filter(isSuccessfulAttachment);

      const attachmentIds = validAttachments.map((attachment) => attachment.id);

      /*
       * Use a stable application URL rather
       * than storing short-lived signed URLs
       * in the chat history.
       *
       * The GET /api/ai/files/[id] endpoint
       * should validate ownership and create
       * a fresh signed URL.
       */
      const messageFiles: FileUIPart[] = validAttachments.map((attachment) => ({
        type: 'file',
        url: `/api/ai/files/${attachment.id}`,
        mediaType: attachment.mimeType,
        filename: attachment.fileName,
      }));

      await sendMessage(
        {
          text,
          files: messageFiles.length > 0 ? messageFiles : undefined,
        },
        {
          body: {
            modelId,
            conversationId: activeConversationId,
            attachmentIds,
          },
        }
      );

      onConversationUpdated?.(activeConversationId);

      /*
       * Files belong to the submitted message.
       * Clear the attachment chips after a
       * successful submission.
       */
      setAttachments([]);
    } catch (error) {
      console.error('Failed to submit message:', error);

      /*
       * Restore text so the user does not
       * lose their prompt.
       */
      setInput(text);
    }
  }

  async function uploadFiles(files: FileList) {
    if (!files.length) {
      return;
    }

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

        /*
         * Do not require a conversation here.
         * The first prompt may create it later.
         */
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

  async function removeAttachment(id: string) {
    try {
      const response = await fetch(`/api/ai/files/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Unable to remove attachment.');
      }
    } catch (error) {
      console.error('Failed to remove attachment:', error);
    } finally {
      setAttachments((current) => current.filter((item) => item.id !== id));
    }
  }

  return (
    <div className="border-t bg-background">
      <form onSubmit={submit} className="mx-auto w-full max-w-4xl p-4">
        <div className="flex flex-col rounded-2xl border border-input bg-background p-1 shadow-sm focus-within:ring-1 focus-within:ring-ring">
          <AttachmentPreview
            attachments={attachments}
            onRemove={removeAttachment}
          />

          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                if (canSubmit) {
                  event.currentTarget.form?.requestSubmit();
                }
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
                accept={[
                  'image/png',
                  'image/jpeg',
                  'image/webp',
                  'image/gif',
                  'application/pdf',
                  'text/plain',
                  'text/markdown',
                  'text/csv',
                  'application/json',
                ].join(',')}
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
                aria-label="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="submit"
              size="icon"
              className="h-8 w-8"
              disabled={!canSubmit}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </div>
  );
}
