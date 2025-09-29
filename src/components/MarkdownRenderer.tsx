'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  useEffect(() => {
    // 页面加载后高亮所有代码块
    hljs.configure({
      ignoreUnescapedHTML: true,
      languages: ['javascript', 'typescript', 'css', 'html', 'json', 'markdown', 'bash', 'shell', 'python', 'java']
    });
    hljs.highlightAll();
  }, [content]);

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (inline) {
              return (
                <code className={`${className} bg-gray-100 px-1 py-0.5 rounded`} {...props}>
                  {children}
                </code>
              );
            }
            
            const code = String(children).replace(/\n$/, '');
            
            return (
              <CodeBlock 
                language={language} 
                value={code}
              />
            );
          },
          // 增强其他Markdown元素的样式
          h1: ({ children, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>{children}</h1>,
          h2: ({ children, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props}>{children}</h2>,
          h3: ({ children, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>,
          p: ({ children, ...props }) => <p className="my-3" {...props}>{children}</p>,
          ul: ({ children, ...props }) => <ul className="list-disc pl-6 my-3" {...props}>{children}</ul>,
          ol: ({ children, ...props }) => <ol className="list-decimal pl-6 my-3" {...props}>{children}</ol>,
          li: ({ children, ...props }) => <li className="my-1" {...props}>{children}</li>,
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 py-1 italic my-4 text-gray-700" {...props}>{children}</blockquote>
          ),
          a: ({ children, ...props }) => (
            <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
          ),
          img: ({ src, alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="max-w-full h-auto rounded-md my-4" src={src} alt={alt || ''} {...props} />
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-300" {...props}>{children}</table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="bg-gray-100 border border-gray-300 px-4 py-2 text-left" {...props}>{children}</th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-gray-300 px-4 py-2" {...props}>{children}</td>
          ),
          hr: ({ ...props }) => (
            <hr className="my-6 border-t border-gray-300" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface CodeBlockProps {
  language: string;
  value: string;
}

function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  useEffect(() => {
    // 组件挂载后高亮代码
    const codeElements = document.querySelectorAll('pre code');
    codeElements.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, []);
  
  return (
    <div className="relative group my-4">
      <pre className="rounded-md bg-gray-50 overflow-x-auto p-4 text-sm">
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="bg-gray-700 hover:bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center"
            title="复制代码"
          >
            {copied ? (
              <>
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                复制
              </>
            )}
          </button>
        </div>
        {language && (
          <div className="absolute left-2 top-2 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            {language}
          </div>
        )}
        <div className={language ? "pt-6" : ""}>
          <code className={language ? `language-${language}` : ''}>
            {value}
          </code>
        </div>
      </pre>
    </div>
  );
} 