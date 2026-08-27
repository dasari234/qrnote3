"use client";

import { useEffect, useState } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useChatApp } from "@/context/ai-chat-context";

interface AIModel {
  id: string;
  provider: string;
  name: string;
  description?: string;
}

export default function ModelSelector() {
  const {
    modelId,
    setModelId,
  } = useChatApp();

  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadModels() {
      try {
        const response = await fetch("/api/models", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Unable to load models",
          );
        }

        const data = await response.json();

        if (mounted) {
          setModels(data.models ?? []);

          if (
            !modelId &&
            data.models?.length
          ) {
            setModelId(data.models[0].id);
          }
        }
      } catch (error) {
        console.error(
          "Failed to load AI models",
          error,
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      mounted = false;
    };
  }, [modelId, setModelId]);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading model...
      </div>
    );
  }

  return (
    <Select
      value={modelId}
      onValueChange={setModelId}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>

      <SelectContent>
        {models.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
          >
            <div className="flex flex-col">
              <span>{model.name}</span>

              <span className="text-xs text-muted-foreground">
                {model.provider}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
