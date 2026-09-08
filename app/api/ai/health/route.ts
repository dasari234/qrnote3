import { generateText } from 'ai';

import { getAIConfig } from '@/lib/ai/config';
import { resolveAIModel } from '@/lib/ai/router';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const config = getAIConfig();

    const model = resolveAIModel(
      'openai-gpt-5'
    );

    const result = await generateText({
      model,
      prompt:
        'Reply with exactly: AI_OK',
      maxOutputTokens: 20,
    });

    return Response.json({
      ok: true,
      text: result.text,
      executionMode:
        config.executionMode,
    });
  } catch (error) {
    console.error(
      '[AI HEALTH ERROR]',
      error
    );

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
