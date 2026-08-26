import {
    BuiltInAgent,
    CopilotRuntime,
    createCopilotRuntimeHandler,
} from '@copilotkit/runtime/v2';
import { NextRequest } from 'next/server';

// Initialize the v2 agent runtime abstraction engine
const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: 'openai/gpt-4o-mini',
    }),
  },
});

// Configure the automatic runtime REST interceptor
const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: '/api/copilotkit',
});

// Export the framework HTTP handlers cleanly
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  return handler(req);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  return handler(req);
}
