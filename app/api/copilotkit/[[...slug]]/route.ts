import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from '@copilotkit/runtime/v2';

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: 'openai:gpt-5.4-mini',

      prompt: `
      You are the QRNote Copilot.

      Help users work with their
      QRNote workspace.

      Be concise and action oriented.
      Never expose secrets or internal
      configuration.
      `,
    }),
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: '/api/copilotkit',
});

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST };

