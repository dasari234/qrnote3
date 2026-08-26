'use client';

import CanvasScreen from '@/components/ai/canvas-screen';
import ChatScreen from '@/components/ai/chat-screen';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChatApp } from '@/context/ai-chat-context';

export default function Page() {
  const { provider, setProvider, currentScreen, setCurrentScreen } = useChatApp();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Application Control Bar */}
      <header className="h-16 border-b px-6 flex items-center justify-between bg-card/50 backdrop-blur">
        <div className="flex items-center gap-8">
          <h1 className="font-bold text-md tracking-tight">AgentOS</h1>

          <Tabs value={currentScreen} onValueChange={(val) => setCurrentScreen(val as any)}>
            <TabsList className="grid w-[240px] grid-cols-2">
              <TabsTrigger value="chat">Thread View</TabsTrigger>
              <TabsTrigger value="canvas">Canvas Studio</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">LLM Kernel:</span>
          <Select value={provider} onValueChange={(val: any) => setProvider(val)}>
            <SelectTrigger className="w-[160px] font-medium shadow-sm">
              <SelectValue placeholder="Choose LLM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI GPT-4o</SelectItem>
              <SelectItem value="anthropic">Anthropic Claude</SelectItem>
              <SelectItem value="google">Google Gemini</SelectItem>
              {/* <SelectItem value="ollama">Ollama (Local Llama)</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Primary Layout Engine Panels */}
      <main className="flex-1 bg-background">
        {currentScreen === 'chat' ? <ChatScreen /> : <CanvasScreen />}
      </main>
    </div>
  );
}
