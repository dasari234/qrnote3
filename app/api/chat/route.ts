import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, provider } = await req.json();

    let modelInstance;

    switch (provider) {
      case 'anthropic':
        const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        modelInstance = anthropic('claude-3-5-sonnet-20240620');
        break;
      case 'google':
        const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
        modelInstance = google('gemini-1.5-pro');
        break;
      case 'ollama':
        const openaiOllamaStyle = createOpenAI({
          baseURL: 'http://localhost:11434/v1',
          apiKey: 'ollama', // Ollama bypasses standard checks
        });
        modelInstance = openaiOllamaStyle('llama3');
        break;
      case 'openai':
      default:
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
        modelInstance = openai('gpt-4o');
        break;
    }

    const result = await streamText({
      model: modelInstance,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
