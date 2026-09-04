import type { ChatRequestOptions, FileUIPart } from 'ai';

export interface ChatConversation {
  id: string;
  title: string;
  modelId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSendMessage {
  text: string;
  files?: FileUIPart[] | FileList;
}

export type ChatSendMessageFn = (
  message: ChatSendMessage,
  options?: ChatRequestOptions
) => Promise<unknown>;
