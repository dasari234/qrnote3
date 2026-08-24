'use client';

import {
    Check,
    Palette,
    Settings2,
    Sparkles,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export type QrCreateStep =
  | 'content'
  | 'advanced'
  | 'branding';

interface QrCreateStepsProps {
  currentStep: QrCreateStep;
  onStepChange: (
    step: QrCreateStep
  ) => void;
  contentComplete?: boolean;
}

const STEPS = [
  {
    id: 'content' as const,
    number: 1,
    label: 'Content',
    description: 'QR type & information',
    icon: Sparkles,
  },
  {
    id: 'advanced' as const,
    number: 2,
    label: 'Advanced',
    description: 'Options & behavior',
    icon: Settings2,
  },
  {
    id: 'branding' as const,
    number: 3,
    label: 'Branding',
    description: 'Style & appearance',
    icon: Palette,
  },
];

export function QrCreateSteps({
  currentStep,
  onStepChange,
}: QrCreateStepsProps) {
  const currentIndex =
    STEPS.findIndex(
      (step) =>
        step.id === currentStep
    );

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="grid grid-cols-3">
        {STEPS.map(
          (step, index) => {
            const Icon = step.icon;

            const active =
              step.id ===
              currentStep;

            const completed =
              index < currentIndex;

            const clickable =
              index <=
              currentIndex;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!clickable}
                onClick={() =>
                  clickable &&
                  onStepChange(
                    step.id
                  )
                }
                className={cn(
                  'relative flex min-h-[76px] items-center gap-3 px-3 py-3 text-left transition-colors sm:px-5',
                  active
                    ? 'bg-primary/[0.06]'
                    : 'hover:bg-muted/40',
                  !clickable &&
                    'cursor-default'
                )}
              >
                {/* Step number / icon */}

                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : completed
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground'
                  )}
                >
                  {completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>

                <span className="min-w-0">
                  <span
                    className={cn(
                      'block text-sm font-semibold',
                      active
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.number}.{' '}
                    {step.label}
                  </span>

                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {step.description}
                  </span>
                </span>

                {/* Active indicator */}

                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}
