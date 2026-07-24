'use client';

import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
interface QrPdfDownloadProps {
  /** ref to the container that holds the <canvas> element */
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  /** QR code name shown as title */
  name: string;
  /** QR type label e.g. "URL", "vCard" */
  typeLabel: string;
  /** Total scan count */
  scanCount: number;
  /** Dynamic or static */
  isDynamic: boolean;
  /** Optional short link URL */
  shortLinkUrl?: string;
  className?: string;
}

export function QrPdfDownload({
  canvasWrapperRef,
  name,
  typeLabel,
  scanCount,
  isDynamic,
  shortLinkUrl,
  className,
}: QrPdfDownloadProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) {
      toast.error('QR canvas not ready — please wait a moment and try again.');
      return;
    }

    setGenerating(true);
    try {
      await generateQrPdf({ canvas, name, typeLabel, scanCount, isDynamic, shortLinkUrl });
    } catch (err: any) {
      toast.error('Failed to generate PDF: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      // Fix: Merge classes using cn to guarantee clean visual changes during theme and status switches
      className={cn(
        "w-full shadow-sm transition-all duration-200 active:scale-[0.99] select-none text-foreground border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
        generating && "bg-muted text-muted-foreground cursor-not-allowed",
        className
      )}
      onClick={handleDownloadPdf}
      disabled={generating}
    >
      {generating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
          <span>Generating PDF…</span>
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4 text-muted-foreground/80 group-hover:text-foreground" />
          <span>Download PDF</span>
        </>
      )}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Core PDF generation function — exported for reuse                   */
/* ------------------------------------------------------------------ */

interface GenerateOptions {
  canvas: HTMLCanvasElement;
  name: string;
  typeLabel: string;
  scanCount: number;
  isDynamic: boolean;
  shortLinkUrl?: string;
}

export async function generateQrPdf({
  canvas,
  name,
  typeLabel,
  scanCount,
  isDynamic,
  shortLinkUrl,
}: GenerateOptions): Promise<void> {
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();   // 210
  const pageH = pdf.internal.pageSize.getHeight();  // 297
  const margin = 16;
  const contentW = pageW - margin * 2;

  // ── 1. Dark header band ──────────────────────────────────────────
  const headerH = 30;
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, pageW, headerH, 'F');

  // App wordmark
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('QRNote', margin, 13);

  // Type badge (right-aligned in header)
  const badgeLabel = typeLabel.toUpperCase();
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const badgeW = pdf.getTextWidth(badgeLabel) + 6;
  const badgeX = pageW - margin - badgeW;
  pdf.setFillColor(99, 102, 241); // indigo-500
  pdf.roundedRect(badgeX, 9, badgeW, 8, 1.5, 1.5, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.text(badgeLabel, badgeX + 3, 14.8);

  // ── 2. QR Code name ─────────────────────────────────────────────
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  // Truncate long names
  const maxChars = 38;
  const displayName = name.length > maxChars ? name.slice(0, maxChars - 1) + '…' : name;
  pdf.text(displayName, pageW / 2, headerH + 16, { align: 'center' });

  // ── 3. Thin divider ─────────────────────────────────────────────
  pdf.setDrawColor(226, 232, 240); // slate-200
  pdf.setLineWidth(0.3);
  pdf.line(margin, headerH + 21, pageW - margin, headerH + 21);

  // ── 4. QR Image — large, centered ───────────────────────────────
  const qrSize = 110;
  const qrX = (pageW - qrSize) / 2;
  const qrY = headerH + 27;

  // Subtle shadow rect behind QR
  pdf.setFillColor(241, 245, 249); // slate-100
  pdf.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 4, 4, 'F');

  pdf.addImage(imgData, 'PNG', qrX, qrY, qrSize, qrSize);

  // ── 5. "Scan me" instruction ─────────────────────────────────────
  const scanY = qrY + qrSize + 14;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(99, 102, 241); // indigo-500
  pdf.text('Point your camera here to scan', pageW / 2, scanY, { align: 'center' });

  // ── 6. Metadata pills row ────────────────────────────────────────
  const pillY = scanY + 14;
  const pillH = 9;
  const pillRadius = 2.5;
  const pills: { label: string; value: string; color: [number, number, number] }[] = [
    { label: 'TYPE', value: typeLabel, color: [99, 102, 241] },
    { label: 'MODE', value: isDynamic ? 'Dynamic' : 'Static', color: isDynamic ? [16, 185, 129] : [100, 116, 139] },
    { label: 'SCANS', value: scanCount.toLocaleString(), color: [245, 158, 11] },
  ];

  const pillSpacing = 4;
  // Measure total width
  pdf.setFontSize(8);
  const pillWidths = pills.map((p) => pdf.getTextWidth(`${p.label}: ${p.value}`) + 8);
  const totalPillW = pillWidths.reduce((a, b) => a + b, 0) + pillSpacing * (pills.length - 1);
  let pillX = (pageW - totalPillW) / 2;

  pills.forEach((pill, i) => {
    const w = pillWidths[i];
    pdf.setFillColor(...pill.color);
    pdf.roundedRect(pillX, pillY, w, pillH, pillRadius, pillRadius, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text(`${pill.label}:`, pillX + 4, pillY + 5.8);
    const labelW = pdf.getTextWidth(`${pill.label}: `);
    pdf.setFont('helvetica', 'normal');
    pdf.text(pill.value, pillX + 4 + labelW, pillY + 5.8);
    pillX += w + pillSpacing;
  });

  // ── 7. Short link (if dynamic) ───────────────────────────────────
  let nextY = pillY + pillH + 10;

  if (isDynamic && shortLinkUrl) {
    const linkClean = shortLinkUrl.replace(/^https?:\/\//, '');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text('Short link:', pageW / 2, nextY, { align: 'center' });
    pdf.setTextColor(99, 102, 241);
    pdf.setFont('helvetica', 'bold');
    pdf.text(linkClean, pageW / 2, nextY + 6, { align: 'center' });
    nextY += 16;
  }

  // ── 8. Instructions box ──────────────────────────────────────────
  const boxY = nextY + 2;
  const boxH = 24;
  pdf.setFillColor(238, 242, 255); // indigo-50
  pdf.setDrawColor(199, 210, 254); // indigo-200
  pdf.setLineWidth(0.4);
  pdf.roundedRect(margin, boxY, contentW, boxH, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(67, 56, 202); // indigo-700
  pdf.text('How to scan:', margin + 5, boxY + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(79, 70, 229);
  pdf.text(
    '1. Open your phone camera app  ·  2. Point at the QR code  ·  3. Tap the notification to open',
    margin + 5,
    boxY + 16,
  );

  // ── 9. Footer ────────────────────────────────────────────────────
  pdf.setFillColor(241, 245, 249); // slate-100
  pdf.rect(0, pageH - 14, pageW, 14, 'F');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184); // slate-400
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  pdf.text(`Generated on ${today}`, margin, pageH - 5);
  pdf.text('Powered by QRNote', pageW - margin, pageH - 5, { align: 'right' });

  // ── 10. Save ─────────────────────────────────────────────────────
  const safeName = name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  pdf.save(`${safeName}-qrcode.pdf`);
}
