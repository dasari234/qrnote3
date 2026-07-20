'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { bulkImportQrCodes, BulkImportRow } from '@/lib/qr/bulk-actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';

interface Props {
  workspaceId: string;
}

const TEMPLATE = `name,type,url,dynamic
My Website,url,https://example.com,true
Summer Flyer,url,https://example.com/summer,false
Contact Card,url,https://example.com/contact,true`;

export function BulkImport({ workspaceId }: Props) {
  const router = useRouter();
  const [csv, setCsv] = useState('');
  const [results, setResults] = useState<{ created: number; errors: string[] } | null>(null);
  const [pending, start] = useTransition();

  const parseCsv = (text: string): BulkImportRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: BulkImportRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = cols[idx];
      });
      rows.push({
        name: row.name || '',
        type: row.type || 'url',
        url: row.url || '',
        dynamic: row.dynamic === 'true' || row.dynamic === '1',
      });
    }
    return rows;
  };

  const handleImport = () => {
    if (!csv.trim()) {
      toast.error('Please paste CSV data or upload a file');
      return;
    }
    const rows = parseCsv(csv);
    if (rows.length === 0) {
      toast.error('No valid rows found');
      return;
    }
    start(async () => {
      try {
        const result = await bulkImportQrCodes(workspaceId, rows);
        setResults(result);
        if (result.created > 0) {
          toast.success(`Created ${result.created} QR codes`);
          router.refresh();
        }
        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} rows had errors`);
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsv(reader.result as string);
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-bulk-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import QR Codes
          </CardTitle>
          <CardDescription>
            Upload a CSV file or paste CSV data to create multiple QR codes at once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-2 text-sm hover:bg-accent/50">
              <Upload className="h-4 w-4" />
              Upload CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv">CSV Data</Label>
            <Textarea
              id="csv"
              rows={10}
              placeholder={TEMPLATE}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <Button onClick={handleImport} disabled={pending || !csv.trim()}>
            {pending ? 'Importing…' : 'Import QR Codes'}
          </Button>

          {results && (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Created {results.created} QR codes
              </div>
              {results.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-destructive">Errors:</p>
                  {results.errors.map((err, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
