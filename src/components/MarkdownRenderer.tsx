'use client';

import { useState, useEffect } from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [mdxSource, setMdxSource] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 处理 Markdown 内容
  useEffect(() => {
    const processMdx = async () => {
      if (!content) return;
      
      try {
        // 预处理内容，修复嵌套的代码块问题
        let processedContent = content;
        
        // 修复嵌套的三重反引号代码块
        processedContent = processedContent.replace(/```\s*```([^`]+)```\s*```/g, '```\n$1```');
        
        const mdxSource = await serialize(processedContent, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeHighlight],
            format: 'md',
          },
          parseFrontmatter: false,
        });
        setMdxSource(mdxSource);
      } catch (error) {
        console.error('Error processing markdown:', error);
      }
    };
    
    processMdx();
  }, [content]);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 添加复制代码按钮
  useEffect(() => {
    if (isMounted && mdxSource) {
      setTimeout(() => {
        const codeBlocks = document.querySelectorAll('pre');
        
        codeBlocks.forEach((codeBlock) => {
          // 如果已经添加了按钮，则跳过
          if (codeBlock.querySelector('.copy-button')) return;
          
          // 创建复制按钮
          const copyButton = document.createElement('button');
          copyButton.className = 'copy-button absolute right-2 top-2 bg-gray-700 hover:bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center';
          copyButton.title = '复制代码';
          copyButton.innerHTML = '<svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>复制';
          
          // 添加点击事件
          copyButton.addEventListener('click', () => {
            const code = codeBlock.querySelector('code')?.textContent || '';
            navigator.clipboard.writeText(code);
            
            // 显示复制成功
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>已复制';
            
            setTimeout(() => {
              copyButton.innerHTML = originalText;
            }, 2000);
          });
          
          // 设置代码块为相对定位，以便放置复制按钮
          codeBlock.style.position = 'relative';
          codeBlock.classList.add('group');
          
          // 添加按钮到代码块
          codeBlock.appendChild(copyButton);
        });
      }, 100); // 延迟一点时间确保 DOM 已更新
    }
  }, [isMounted, mdxSource]);

  // 如果组件未挂载或内容未处理完成，显示加载状态
  if (!isMounted || !mdxSource) {
    return <div className="animate-pulse bg-gray-100 h-20 rounded"></div>;
  }

  return (
    <div className="prose prose-sm max-w-none">
      <MDXRemote
        {...mdxSource}
        components={{
          // 自定义组件样式
          h1: (props: any) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: (props: any) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: (props: any) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          p: (props: any) => <p className="my-3" {...props} />,
          ul: (props: any) => <ul className="list-disc pl-6 my-3" {...props} />,
          ol: (props: any) => <ol className="list-decimal pl-6 my-3" {...props} />,
          li: (props: any) => <li className="my-1" {...props} />,
          blockquote: (props: any) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 py-1 italic my-4 text-gray-700" {...props} />
          ),
          a: (props: any) => (
            <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          img: (props: any) => (
            <img className="max-w-full h-auto rounded-md my-4" {...props} />
          ),
          pre: (props: any) => (
            <pre className="rounded-md bg-gray-50 overflow-x-auto p-4 text-sm relative my-4 group" {...props} />
          ),
          code: (props: any) => {
            const { className } = props;
            // 内联代码
            if (!className) {
              return <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />;
            }
            // 代码块
            return <code className={className} {...props} />;
          },
          table: (props: any) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-300" {...props} />
            </div>
          ),
          th: (props: any) => (
            <th className="bg-gray-100 border border-gray-300 px-4 py-2 text-left" {...props} />
          ),
          td: (props: any) => (
            <td className="border border-gray-300 px-4 py-2" {...props} />
          ),
          hr: (props: any) => (
            <hr className="my-6 border-t border-gray-300" {...props} />
          )
        }}
      />
    </div>
  );
} 