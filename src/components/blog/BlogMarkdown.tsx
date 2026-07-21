'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ImageLightbox } from '@/components/events/ImageLightbox';
import { cn } from '@/lib/utils/cn';

interface BlogMarkdownProps {
  content: string;
  className?: string;
}

function collectMarkdownImages(markdown: string): string[] {
  const urls: string[] = [];
  const re = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    if (match[1] && !urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }
  return urls;
}

export function BlogMarkdown({ content, className }: BlogMarkdownProps) {
  const images = useMemo(() => collectMarkdownImages(content), [content]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const components: Components = useMemo(
    () => ({
      h1: ({ children }) => (
        <h1 className="text-3xl md:text-4xl font-bold text-white mt-10 mb-4">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-2xl md:text-3xl font-bold text-white mt-10 mb-4">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-xl md:text-2xl font-semibold text-white mt-8 mb-3">{children}</h3>
      ),
      p: ({ children }) => (
        <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
      ),
      ul: ({ children }) => (
        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-300">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-300">{children}</ol>
      ),
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      strong: ({ children }) => (
        <strong className="font-semibold text-white">{children}</strong>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
        >
          {children}
        </a>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-brand-500/40 pl-4 my-4 text-gray-400 italic">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="border-white/10 my-8" />,
      img: ({ src, alt }) => {
        const url = typeof src === 'string' ? src : '';
        if (!url) return null;
        const open = () => {
          const i = images.indexOf(url);
          setLightboxIndex(i >= 0 ? i : 0);
        };
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={alt || ''}
            loading="lazy"
            role="button"
            tabIndex={0}
            onClick={open}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
              }
            }}
            className="my-6 w-full max-h-[28rem] object-cover rounded-2xl border border-white/10 bg-black/40 cursor-zoom-in"
          />
        );
      },
      code: ({ className: codeClass, children }) => {
        const isBlock = Boolean(codeClass);
        if (isBlock) {
          return (
            <code className={cn('block text-sm text-gray-200', codeClass)}>{children}</code>
          );
        }
        return (
          <code className="px-1.5 py-0.5 rounded bg-white/10 text-brand-300 text-sm">
            {children}
          </code>
        );
      },
      pre: ({ children }) => (
        <pre className="rounded-xl bg-black/50 border border-white/10 p-4 overflow-x-auto mb-4">
          {children}
        </pre>
      ),
    }),
    [images]
  );

  return (
    <>
      <div className={cn('blog-markdown max-w-none', className)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
      {lightboxIndex !== null && images.length > 0 ? (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          alt="Blog"
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
