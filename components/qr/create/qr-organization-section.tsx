'use client';

import {
    Card,
    CardContent,
} from '@/components/ui/card';

import { Folder, Tags } from 'lucide-react';

interface Props {
  folders: {
    id: string;
    name: string;
  }[];

  tags: {
    id: string;
    name: string;
    color: string;
  }[];

  folderId: string;
  selectedTags: string[];

  onFolderChange: (
    value: string
  ) => void;

  onTagToggle: (
    id: string
  ) => void;
}

export function QrOrganizationSection({
  folders,
  tags,
  folderId,
  selectedTags,
  onFolderChange,
  onTagToggle,
}: Props) {
  if (
    folders.length === 0 &&
    tags.length === 0
  ) {
    return null;
  }

  return (
    <section>
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            3
          </span>

          <h2 className="text-base font-semibold">
            Organization
          </h2>
        </div>

        <p className="ml-8 mt-1 text-sm text-muted-foreground">
          Keep your QR codes organized for easier
          management.
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="grid gap-6 p-5 md:grid-cols-2">
          {folders.length > 0 && (
            <div className="space-y-2">
              <label
                htmlFor="qr-folder"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <Folder className="h-4 w-4 text-muted-foreground" />
                Folder
              </label>

              <select
                id="qr-folder"
                value={folderId}
                onChange={(event) =>
                  onFolderChange(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="">
                  No folder
                </option>

                {folders.map((folder) => (
                  <option
                    key={folder.id}
                    value={folder.id}
                  >
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tags.length > 0 && (
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Tags className="h-4 w-4 text-muted-foreground" />
                Tags
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active =
                    selectedTags.includes(
                      tag.id
                    );

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        onTagToggle(tag.id)
                      }
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-muted'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            tag.color,
                        }}
                      />

                      {tag.name}

                      {active && (
                        <span>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
