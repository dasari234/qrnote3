"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FileText,
    LayoutTemplate,
    Sparkles,
} from "lucide-react";

export default function CanvasScreen() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Canvas Header */}
      <div className="border-b px-6 py-4">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Canvas Studio
            </h2>

            <p className="text-sm text-muted-foreground">
              Create and work with AI-generated content
              in a workspace.
            </p>
          </div>

          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            New Canvas
          </Button>
        </div>
      </div>

      {/* Canvas Workspace */}
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="mx-auto flex min-h-full w-full max-w-7xl items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl border bg-background">
                <LayoutTemplate className="h-6 w-6 text-muted-foreground" />
              </div>

              <CardTitle>
                Canvas Studio
              </CardTitle>

              <CardDescription>
                Your AI canvas workspace will be available
                here.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <CanvasFeature
                  icon={
                    <FileText className="h-5 w-5" />
                  }
                  title="Documents"
                  description="Create AI-generated documents."
                />

                <CanvasFeature
                  icon={
                    <Sparkles className="h-5 w-5" />
                  }
                  title="AI Generation"
                  description="Generate and refine content."
                />

                <CanvasFeature
                  icon={
                    <LayoutTemplate className="h-5 w-5" />
                  }
                  title="Workspace"
                  description="Organize your AI work."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface CanvasFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function CanvasFeature({
  icon,
  title,
  description,
}: CanvasFeatureProps) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border">
        {icon}
      </div>

      <h3 className="text-sm font-medium">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
