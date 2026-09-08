import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage
} from 'ai';

import { AI_AGENT_SYSTEM_PROMPT } from '@/lib/ai/agent';
import { saveChatMessages } from '@/lib/ai/chat-persistence';
import { getAIConfig } from '@/lib/ai/config';
import { getAIModel } from '@/lib/ai/models';
import { resolveAIModel } from '@/lib/ai/router';
import { createAITools } from '@/lib/ai/tools';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface ChatRequestBody {
  conversationId?: string;
  modelId?: string;
  messages?: UIMessage[];
  attachmentIds?: string[];
}

function isValidMessages(messages: unknown): messages is UIMessage[] {
  return (
    Array.isArray(messages) &&
    messages.every(
      (message) =>
        typeof message === 'object' &&
        message !== null &&
        typeof (message as UIMessage).id === 'string' &&
        typeof (message as UIMessage).role === 'string' &&
        Array.isArray((message as UIMessage).parts)
    )
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown AI provider error.';
    }
  }

  return String(error);
}

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  let userId: string | undefined;
  let conversationId: string | undefined;

  try {
    const body = (await req.json()) as ChatRequestBody;

    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required.',
          },
        },
        { status: 401 }
      );
    }

    userId = user.id;

    const modelId = body.modelId?.trim();

    if (!modelId) {
      return Response.json(
        {
          error: {
            code: 'MODEL_REQUIRED',
            message: 'modelId is required.',
          },
        },
        { status: 400 }
      );
    }

    if (!isValidMessages(body.messages)) {
      return Response.json(
        {
          error: {
            code: 'INVALID_MESSAGES',
            message: 'Invalid messages payload.',
          },
        },
        { status: 400 }
      );
    }

    if (!body.conversationId) {
      return Response.json(
        {
          error: {
            code: 'CONVERSATION_REQUIRED',
            message: 'conversationId is required.',
          },
        },
        { status: 400 }
      );
    }

    conversationId = body.conversationId;

    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!conversation) {
      return Response.json(
        {
          error: {
            code: 'CONVERSATION_NOT_FOUND',
            message: 'Conversation not found.',
          },
        },
        { status: 404 }
      );
    }

    const modelDefinition = getAIModel(modelId);

    if (!modelDefinition) {
      return Response.json(
        {
          error: {
            code: 'MODEL_NOT_FOUND',
            message: `AI model "${modelId}" does not exist or is disabled.`,
          },
        },
        { status: 400 }
      );
    }

    const attachmentIds = [...new Set(body.attachmentIds ?? [])];

    if (attachmentIds.length) {
      const attachments = await prisma.aiAttachment.findMany({
        where: {
          id: {
            in: attachmentIds,
          },
          userId: user.id,
        },
        select: {
          id: true,
          conversationId: true,
          status: true,
        },
      });

      if (attachments.length !== attachmentIds.length) {
        return Response.json(
          {
            error: {
              code: 'INVALID_ATTACHMENTS',
              message: 'One or more attachments are not accessible.',
            },
          },
          { status: 403 }
        );
      }

      const wrongConversation = attachments.some(
        (attachment) =>
          attachment.conversationId !== null &&
          attachment.conversationId !== conversation.id
      );

      if (wrongConversation) {
        return Response.json(
          {
            error: {
              code: 'ATTACHMENT_CONVERSATION_MISMATCH',
              message:
                'One or more attachments belong to another conversation.',
            },
          },
          { status: 403 }
        );
      }

      const failed = attachments.some(
        (attachment) => attachment.status === 'failed'
      );

      if (failed) {
        return Response.json(
          {
            error: {
              code: 'ATTACHMENT_NOT_READY',
              message: 'One or more attachments failed to process.',
            },
          },
          { status: 400 }
        );
      }

      await prisma.aiAttachment.updateMany({
        where: {
          id: {
            in: attachmentIds,
          },
          userId: user.id,
          conversationId: null,
        },
        data: {
          conversationId: conversation.id,
        },
      });
    }

    const config = getAIConfig();

    console.info('[AI CHAT REQUEST]', {
      userId: user.id,
      conversationId: conversation.id,
      modelId,
      provider: modelDefinition.provider,
      providerModel: modelDefinition.model,
      messageCount: body.messages.length,
      attachmentCount: attachmentIds.length,
    });

    const model = resolveAIModel(modelId);

    const tools = createAITools({
      userId: user.id,
    });

    const modelMessages = await convertToModelMessages(body.messages);

    /*
     * Save the incoming user message.
     *
     * saveChatMessages() is idempotent,
     * so the final save can safely include it
     * again.
     */
    await saveChatMessages({
      conversationId: conversation.id,
      userId: user.id,
      modelId,
      messages: body.messages,
    });

    const streamOptions: Parameters<typeof streamText>[0] = {
      model,

      messages: modelMessages,

      system: AI_AGENT_SYSTEM_PROMPT,

      maxOutputTokens: config.maxTokens,

      tools,

      stopWhen: stepCountIs(Number(process.env.AI_AGENT_MAX_STEPS ?? 6)),

      abortSignal: req.signal,

      onError({ error }) {
        console.error('[AI PROVIDER ERROR]', {
          message: getErrorMessage(error),
          modelId,
          provider: modelDefinition.provider,
          model: modelDefinition.model,
          conversationId: conversation.id,
        });
      },
    };

    if (modelDefinition.supportsTemperature) {
      streamOptions.temperature = config.temperature;
    }

    const result = streamText(streamOptions);

    /*
     * Make sure the stream is consumed so
     * onFinish runs reliably, including
     * disconnect/abort cases.
     */
    result.consumeStream();

    return result.toUIMessageStreamResponse({
      originalMessages: body.messages,

      onFinish: async ({ messages, isAborted }) => {
        try {
          if (isAborted) {
            console.warn('[AI CHAT ABORTED]', {
              conversationId: conversation.id,
            });
          }

          /*
           * AI SDK supplies the complete UI
           * message history here.
           */
          await saveChatMessages({
            conversationId: conversation.id,
            userId: user.id,
            modelId,
            messages,
          });

          console.info('[AI CHAT PERSISTED]', {
            conversationId: conversation.id,
            messageCount: messages.length,
            isAborted,
          });
        } catch (error) {
          console.error('[AI PERSISTENCE ERROR]', error);
        }
      },
    });
  } catch (error) {
    const message = getErrorMessage(error);

    console.error('[AI CHAT FATAL ERROR]', {
      message,
      userId,
      conversationId,
    });

    return Response.json(
      {
        error: {
          code: 'AI_REQUEST_FAILED',
          message,
        },
      },
      { status: 500 }
    );
  }
}
