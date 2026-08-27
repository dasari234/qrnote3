"use client";

import { useEffect, useState } from "react";

interface AIModel {
  id: string;
  provider: string;
  name: string;
  description?: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

export function ModelSelector({
  value,
  onChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<AIModel[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      try {
        const response = await fetch(
          "/api/models",
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load models",
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setModels(data.models ?? []);
        }
      } catch (error) {
        console.error(
          "Failed to load AI models:",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading models...
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-9 rounded-md border bg-background px-3 text-sm"
    >
      {models.map((model) => (
        <option
          key={model.id}
          value={model.id}
        >
          {model.name}
        </option>
      ))}
    </select>
  );
}
