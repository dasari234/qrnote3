import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';

import { AI_AGENT_SYSTEM_PROMPT } from '@/lib/ai/agent';
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
    messages.every((message) => typeof message === 'object' && message !== null)
  );
}

function supportsTemperature(modelId: string): boolean {
  const model = getAIModel(modelId);

  if (!model) {
    return false;
  }

  /**
   * GPT-5 / GPT-5-mini reasoning models don't accept
   * custom temperature values.
   */
  if (model.provider === 'openai' && /^gpt-5(?:-|$)/i.test(model.model)) {
    return false;
  }

  return true;
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

    const modelId = body.modelId;

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

    /**
     * Validate conversation ownership.
     */
    if (body.conversationId) {
      const conversation = await prisma.aiConversation.findFirst({
        where: {
          id: body.conversationId,
          userId: user.id,
        },
        select: {
          id: true,
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
    }

    /**
     * Validate attachment ownership.
     */
    if (body.attachmentIds?.length) {
      const attachments = await prisma.aiAttachment.findMany({
        where: {
          id: {
            in: body.attachmentIds,
          },
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (attachments.length !== body.attachmentIds.length) {
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
    }

    const config = getAIConfig();

    const model = resolveAIModel(modelId);

    const tools = createAITools({
      userId: user.id,
    });

    const modelMessages = await convertToModelMessages(body.messages);

    /**
     * Build streamText options dynamically.
     *
     * Do not send temperature to GPT-5/GPT-5-mini.
     */
    const streamOptions: Parameters<typeof streamText>[0] = {
      model,

      messages: modelMessages,

      system: AI_AGENT_SYSTEM_PROMPT,

      maxOutputTokens: config.maxTokens,

      tools,

      stopWhen: stepCountIs(6),

      onError({ error }) {
        console.error('AI stream error:', error);
      },
    };

    if (supportsTemperature(modelId)) {
      streamOptions.temperature = config.temperature;
    }

    console.log('[AI CHAT]', {
      userId: user.id,
      modelId,
      provider: modelDefinition.provider,
      model: modelDefinition.model,
      conversationId: body.conversationId ?? null,
      attachmentCount: body.attachmentIds?.length ?? 0,
      messageCount: body.messages.length,
      temperatureApplied: supportsTemperature(modelId),
    });

    const result = streamText(streamOptions);

    return result.toUIMessageStreamResponse({
      originalMessages: body.messages,
    });
  } catch (error) {
    console.error('AI chat request failed:', error);

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
