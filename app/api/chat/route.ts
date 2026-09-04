import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
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

export const runtime = 'nodejs';

export const maxDuration = 60;

export async function POST(req: Request) {
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

    /*
     * This route expects the client to create the
     * conversation when the first prompt is sent.
     *
     * Keeping this server-side validation strict
     * prevents messages from being stored without
     * a conversation owner.
     */
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

    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: body.conversationId,
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

    /*
     * Validate attachment ownership and
     * conversation association.
     */
    const attachmentIds = [
      ...new Set((body.attachmentIds ?? []).filter(Boolean)),
    ];

    if (attachmentIds.length > 0) {
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

      const invalidConversationAttachment = attachments.some(
        (attachment) =>
          attachment.conversationId !== null &&
          attachment.conversationId !== conversation.id
      );

      if (invalidConversationAttachment) {
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

      const failedAttachments = attachments.filter(
        (attachment) => attachment.status === 'failed'
      );

      if (failedAttachments.length > 0) {
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

      /*
       * Associate previously uploaded files
       * with this conversation.
       *
       * This is especially important for the
       * first prompt because the conversation
       * was created after the user selected files.
       */
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

    const model = resolveAIModel(modelId);

    const tools = createAITools({
      userId: user.id,
    });

    const modelMessages = await convertToModelMessages(body.messages);

    /*
     * Persist the incoming user message before
     * starting the model.
     *
     * This guarantees that the prompt is not lost
     * even if the provider fails.
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

      onError({ error }) {
        console.error('[AI STREAM ERROR]', error);
      },
    };

    /*
     * GPT-5 and GPT-5-mini currently have
     * supportsTemperature=false in models.ts.
     */
    if (modelDefinition.supportsTemperature) {
      streamOptions.temperature = config.temperature;
    }

    console.info('[AI CHAT]', {
      userId: user.id,
      conversationId: conversation.id,
      modelId,
      provider: modelDefinition.provider,
      model: modelDefinition.model,
      messages: body.messages.length,
      attachments: attachmentIds.length,
      temperature: modelDefinition.supportsTemperature
        ? config.temperature
        : undefined,
    });

    const result = streamText(streamOptions);

    return result.toUIMessageStreamResponse({
      originalMessages: body.messages,

      /*
       * AI SDK gives us the generated UI
       * messages after streaming completes.
       *
       * Merge them with the original messages
       * and let persistence deduplicate IDs.
       */
      onFinish: async ({ messages }) => {
        try {
          const completedMessages = messages ?? [];

          if (completedMessages.length === 0) {
            console.warn(
              '[AI CHAT] No completed messages returned from stream.'
            );

            return;
          }

          await saveChatMessages({
            conversationId: conversation.id,
            userId: user.id,
            modelId,
            messages: completedMessages,
          });

          console.info('[AI CHAT SAVED]', {
            conversationId: conversation.id,
            messageCount: completedMessages.length,
          });
        } catch (persistError) {
          console.error('[AI PERSISTENCE ERROR]', persistError);
        }
      },
    });
  } catch (error) {
    console.error('[AI CHAT REQUEST FAILED]', error);

    return Response.json(
      {
        error: {
          code: 'AI_REQUEST_FAILED',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to process AI request.',
        },
      },
      { status: 500 }
    );
  }
}
