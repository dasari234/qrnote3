import { tool } from 'ai';
import { z } from 'zod';

import { searchKnowledge } from '@/lib/ai/rag';

import { searchWeb } from '@/lib/ai/web-search';

export interface AIToolContext {
  userId: string;
}

function safeCalculate(expression: string): number {
  if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
    throw new Error('Invalid arithmetic expression.');
  }

  // The whitelist above prevents identifiers,
  // strings, property access and function calls.
  // eslint-disable-next-line no-new-func
  const value = Function(`"use strict"; return (${expression})`)();

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Expression did not produce a finite number.');
  }

  return value;
}

export function createAITools(context: AIToolContext) {
  return {
    calculator: tool({
      description: 'Calculate a basic arithmetic expression.',

      inputSchema: z.object({
        expression: z.string().min(1).max(200),
      }),

      execute: async ({ expression }) => {
        try {
          return {
            expression,
            result: safeCalculate(expression),
          };
        } catch {
          return {
            expression,
            error: 'Unable to calculate the expression.',
          };
        }
      },
    }),

    currentTime: tool({
      description: 'Get the current date and time for an IANA timezone.',

      inputSchema: z.object({
        timezone: z.string().default('UTC'),
      }),

      execute: async ({ timezone }) => {
        try {
          return {
            timezone,
            currentTime: new Intl.DateTimeFormat('en-IN', {
              dateStyle: 'full',
              timeStyle: 'long',
              timeZone: timezone,
            }).format(new Date()),
          };
        } catch {
          return {
            timezone,
            error: 'Invalid timezone.',
          };
        }
      },
    }),

    knowledgeSearch: tool({
      description:
        "Search the user's uploaded documents using semantic search.",

      inputSchema: z.object({
        query: z.string().min(2).max(1000),
      }),

      execute: async ({ query }) => {
        const results = await searchKnowledge(context.userId, query, 8);

        return {
          query,
          results,
        };
      },
    }),

    webSearch: tool({
      description: 'Search the public web for current information.',

      inputSchema: z.object({
        query: z.string().min(2).max(500),
      }),

      execute: async ({ query }) => {
        const results = await searchWeb(query);

        return {
          query,
          ...results,
        };
      },
    }),
  };
}
