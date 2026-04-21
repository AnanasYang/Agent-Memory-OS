'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  maxLength?: number;
}

export function MarkdownRenderer({ content, className = '', maxLength }: MarkdownRendererProps) {
  const displayContent = maxLength && content.length > maxLength 
    ? content.slice(0, maxLength) + '\n\n...'
    : content;

  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-3 pb-2 border-b border-white/10">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-white/90 mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-medium text-white/80 mt-2 mb-1.5">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-slate-300 leading-relaxed mb-3">{children}</p>,
          ul: ({ children }) => <ul className="text-sm text-slate-300 list-disc list-inside mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="text-sm text-slate-300 list-decimal list-inside mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ children, className }: any) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-amber-300 font-mono">
                {children}
              </code>
            ) : (
              <pre className="bg-black/50 rounded-lg p-3 my-3 overflow-x-auto">
                <code className="text-xs text-slate-300 font-mono">
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-500/50 pl-3 my-3 text-slate-400 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="text-xs text-slate-300 border-collapse w-full">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-white/10 px-3 py-2 text-left text-white/80 font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-white/10 px-3 py-2">{children}</td>
          ),
          hr: () => <hr className="border-white/10 my-4" />,
          a: ({ children, href }: any) => (
            <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
          em: ({ children }) => <em className="text-slate-300 italic">{children}</em>,
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}
