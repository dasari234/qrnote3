"use client";

import {
    useEffect,
    useState,
} from "react";

type Tab =
  | "providers"
  | "models"
  | "routing"
  | "usage"
  | "costs"
  | "flags";

interface Provider {
  id: string;
  slug: string;
  name: string;
  description?: string;
  enabled: boolean;
  executionMode: string;
  apiKeyEnv?: string;
}

interface Model {
  id: string;
  modelKey: string;
  providerId: string;
  provider: string;
  providerName: string;
  providerModel: string;
  name: string;
  description?: string;
  enabled: boolean;
  maxOutputTokens: number;
}

interface RoutingRule {
  id: string;
  workspaceId?: string | null;
  provider?: string | null;
  modelKey?: string | null;
  priority: number;
  enabled: boolean;
}

interface Cost {
  id: string;
  modelId: string;
  modelKey: string;
  inputPerMillion: number;
  outputPerMillion: number;
  currency: string;
}

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  environment: string;
}

export function AdminAIClient() {
  const [tab, setTab] =
    useState<Tab>("providers");

  const [providers, setProviders] =
    useState<Provider[]>([]);

  const [models, setModels] =
    useState<Model[]>([]);

  const [routing, setRouting] =
    useState<RoutingRule[]>([]);

  const [costs, setCosts] =
    useState<Cost[]>([]);

  const [flags, setFlags] =
    useState<FeatureFlag[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function load() {
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/ai/config",
          {
            cache: "no-store",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load AI configuration.",
        );
      }

      const data =
        await response.json();

      setProviders(
        data.providers ?? [],
      );

      setModels(
        data.models ?? [],
      );

      setRouting(
        data.routing ?? [],
      );

      setCosts(
        data.costs ?? [],
      );

      setFlags(
        data.featureFlags ?? [],
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function update(
    type:
      | "provider"
      | "model"
      | "routing"
      | "feature",
    id: string,
    enabled: boolean,
  ) {
    const response =
      await fetch(
        "/api/admin/ai/config/update",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            type,
            id,
            enabled,
          }),
        },
      );

    if (!response.ok) {
      throw new Error(
        "Update failed.",
      );
    }

    await load();
  }

  const tabs: {
    id: Tab;
    label: string;
  }[] = [
    {
      id: "providers",
      label: "Providers",
    },
    {
      id: "models",
      label: "Models",
    },
    {
      id: "routing",
      label: "Routing",
    },
    {
      id: "usage",
      label: "Usage",
    },
    {
      id: "costs",
      label: "Costs",
    },
    {
      id: "flags",
      label: "Feature Flags",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          AI Administration
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage providers, models,
          routing, usage, costs and
          AI feature availability.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setTab(item.id)
            }
            className={[
              "rounded-md px-3 py-2 text-sm",
              tab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Loading AI configuration...
        </div>
      ) : (
        <>
          {tab === "providers" && (
            <ProvidersTab
              providers={providers}
              onToggle={(id, enabled) =>
                update(
                  "provider",
                  id,
                  enabled,
                )
              }
            />
          )}

          {tab === "models" && (
            <ModelsTab
              models={models}
              onToggle={(id, enabled) =>
                update(
                  "model",
                  id,
                  enabled,
                )
              }
            />
          )}

          {tab === "routing" && (
            <RoutingTab
              routing={routing}
              onToggle={(id, enabled) =>
                update(
                  "routing",
                  id,
                  enabled,
                )
              }
            />
          )}

          {tab === "usage" && (
            <UsageTab />
          )}

          {tab === "costs" && (
            <CostsTab
              costs={costs}
            />
          )}

          {tab === "flags" && (
            <FlagsTab
              flags={flags}
              onToggle={(id, enabled) =>
                update(
                  "feature",
                  id,
                  enabled,
                )
              }
            />
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full px-2 py-1 text-xs",
        enabled
          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {enabled
        ? "Enabled"
        : "Disabled"}
    </span>
  );
}

function Toggle({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md border px-3 py-1.5 text-xs",
        enabled
          ? "border-green-500"
          : "",
      ].join(" ")}
    >
      {enabled
        ? "Disable"
        : "Enable"}
    </button>
  );
}

function ProvidersTab({
  providers,
  onToggle,
}: {
  providers: Provider[];
  onToggle: (
    id: string,
    enabled: boolean,
  ) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {providers.map(
        (provider) => (
          <div
            key={provider.id}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">
                  {provider.name}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {provider.description}
                </p>
              </div>

              <StatusBadge
                enabled={
                  provider.enabled
                }
              />
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Mode
                </span>

                <span>
                  {
                    provider.executionMode
                  }
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  API key
                </span>

                <code className="text-xs">
                  {provider.apiKeyEnv ??
                    "Not configured"}
                </code>
              </div>
            </div>

            <div className="mt-5">
              <Toggle
                enabled={
                  provider.enabled
                }
                onClick={() =>
                  onToggle(
                    provider.id,
                    !provider.enabled,
                  )
                }
              />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function ModelsTab({
  models,
  onToggle,
}: {
  models: Model[];
  onToggle: (
    id: string,
    enabled: boolean,
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left">
              Model
            </th>
            <th className="px-4 py-3 text-left">
              Provider
            </th>
            <th className="px-4 py-3 text-left">
              API Model
            </th>
            <th className="px-4 py-3 text-left">
              Status
            </th>
            <th />
          </tr>
        </thead>

        <tbody>
          {models.map(
            (model) => (
              <tr
                key={model.id}
                className="border-t"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {model.name}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {model.modelKey}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {model.providerName}
                </td>

                <td className="px-4 py-3">
                  <code className="text-xs">
                    {
                      model.providerModel
                    }
                  </code>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge
                    enabled={
                      model.enabled
                    }
                  />
                </td>

                <td className="px-4 py-3 text-right">
                  <Toggle
                    enabled={
                      model.enabled
                    }
                    onClick={() =>
                      onToggle(
                        model.id,
                        !model.enabled,
                      )
                    }
                  />
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function RoutingTab({
  routing,
  onToggle,
}: {
  routing: RoutingRule[];
  onToggle: (
    id: string,
    enabled: boolean,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-5">
        <h3 className="font-semibold">
          Model Routing
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Lower priority numbers are
          evaluated first.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">
                Priority
              </th>
              <th className="px-4 py-3 text-left">
                Provider
              </th>
              <th className="px-4 py-3 text-left">
                Model
              </th>
              <th className="px-4 py-3">
                Status
              </th>
              <th />
            </tr>
          </thead>

          <tbody>
            {routing.map(
              (rule) => (
                <tr
                  key={rule.id}
                  className="border-t"
                >
                  <td className="px-4 py-3">
                    {rule.priority}
                  </td>

                  <td className="px-4 py-3">
                    {rule.provider ??
                      "Any"}
                  </td>

                  <td className="px-4 py-3">
                    {rule.modelKey ??
                      "Provider default"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <StatusBadge
                      enabled={
                        rule.enabled
                      }
                    />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Toggle
                      enabled={
                        rule.enabled
                      }
                      onClick={() =>
                        onToggle(
                          rule.id,
                          !rule.enabled,
                        )
                      }
                    />
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsageTab() {
  const [data, setData] =
    useState<{
      requests: number;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      estimatedCost: number;
      activeUsers: number;
    } | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai/usage")
      .then((response) =>
        response.json(),
      )
      .then((result) =>
        setData(result),
      )
      .catch(console.error);
  }, []);

  const cards = [
    [
      "Requests",
      data?.requests ?? 0,
    ],
    [
      "Input Tokens",
      data?.inputTokens ?? 0,
    ],
    [
      "Output Tokens",
      data?.outputTokens ?? 0,
    ],
    [
      "Total Tokens",
      data?.totalTokens ?? 0,
    ],
    [
      "Estimated Cost",
      `$${(
        data?.estimatedCost ?? 0
      ).toFixed(4)}`,
    ],
    [
      "Active Users",
      data?.activeUsers ?? 0,
    ],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(
        ([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border p-5"
          >
            <div className="text-sm text-muted-foreground">
              {label}
            </div>

            <div className="mt-2 text-2xl font-semibold">
              {value}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function CostsTab({
  costs,
}: {
  costs: Cost[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left">
              Model
            </th>
            <th className="px-4 py-3 text-right">
              Input / 1M
            </th>
            <th className="px-4 py-3 text-right">
              Output / 1M
            </th>
            <th className="px-4 py-3 text-right">
              Currency
            </th>
          </tr>
        </thead>

        <tbody>
          {costs.map(
            (cost) => (
              <tr
                key={cost.id}
                className="border-t"
              >
                <td className="px-4 py-3">
                  {cost.modelKey}
                </td>

                <td className="px-4 py-3 text-right">
                  {cost.inputPerMillion}
                </td>

                <td className="px-4 py-3 text-right">
                  {cost.outputPerMillion}
                </td>

                <td className="px-4 py-3 text-right">
                  {cost.currency}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function FlagsTab({
  flags,
  onToggle,
}: {
  flags: FeatureFlag[];
  onToggle: (
    id: string,
    enabled: boolean,
  ) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {flags.map((flag) => (
        <div
          key={flag.id}
          className="flex items-center justify-between rounded-xl border p-5"
        >
          <div>
            <div className="font-medium">
              {flag.name}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              {flag.description}
            </div>

            <code className="mt-2 block text-xs text-muted-foreground">
              {flag.key}
            </code>
          </div>

          <div className="ml-4 flex shrink-0 items-center gap-3">
            <StatusBadge
              enabled={flag.enabled}
            />

            <Toggle
              enabled={flag.enabled}
              onClick={() =>
                onToggle(
                  flag.id,
                  !flag.enabled,
                )
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
