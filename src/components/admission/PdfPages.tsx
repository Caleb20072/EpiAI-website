'use client';

import { useEffect, useState } from 'react';

/** Shows the original PDF as-is (maps, figures, every page) - not extracted text. */
export function PdfPages({ src, className = '' }: { src: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';
    setLoading(true);
    setFailed(false);
    setPages([]);
    setUrl(null);

    void (async () => {
      try {
        const res = await fetch(src, { credentials: 'include' });
        if (!res.ok) throw new Error('pdf');
        const buffer = await res.arrayBuffer();
        const blob = new Blob([buffer], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setUrl(objectUrl);

        try {
          const { getDocumentProxy } = await import('unpdf');
          const pdf = await getDocumentProxy(new Uint8Array(buffer));
          const urls: string[] = [];
          for (let n = 1; n <= pdf.numPages; n++) {
            const page = await pdf.getPage(n);
            const viewport = page.getViewport({ scale: 1.85 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('canvas');
            const task = page.render({ canvasContext: ctx, canvas, viewport });
            await task.promise;
            urls.push(canvas.toDataURL('image/png'));
          }
          if (!cancelled && urls.length) setPages(urls);
        } catch {
          /* native PDF viewer below is the complete fallback */
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (failed) {
    return <p className={`text-sm text-red-400 ${className}`}>Impossible d’afficher le document.</p>;
  }

  if (pages.length > 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {pages.map((pageUrl, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={pageUrl}
            alt={`Page ${i + 1}`}
            draggable={false}
            className="w-full rounded-lg bg-white shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (url) {
    return (
      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
        title="Document"
        className={`h-[min(92vh,1400px)] w-full rounded-xl bg-white ${className}`}
      />
    );
  }

  if (loading) {
    return <p className={`text-sm text-secondary ${className}`}>Chargement du document…</p>;
  }

  return <p className={`text-sm text-secondary ${className}`}>Document indisponible.</p>;
}
