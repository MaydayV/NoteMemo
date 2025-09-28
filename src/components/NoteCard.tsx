'use client';

import { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    // 移除Markdown语法标记，保留纯文本
    const plainText = content
      .replace(/```[\s\S]*?```/g, '[代码块]') // 替换代码块
      .replace(/`([^`]+)`/g, '$1') // 移除行内代码符号
      .replace(/!\[.*?\]\(.*?\)/g, '[图片]') // 替换图片
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // 替换链接为纯文本
      .replace(/#{1,6}\s+/g, '') // 移除标题符号
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // 移除加粗符号
      .replace(/(\*|_)(.*?)\1/g, '$2') // 移除斜体符号
      .replace(/\n+/g, ' ') // 将换行替换为空格
      .replace(/\s+/g, ' ') // 将多个空格合并为一个
      .trim();
    
    return plainText.length > maxLength
      ? plainText.slice(0, maxLength) + '...'
      : plainText;
  };

  return (
    <div
      className="border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer group bg-white rounded-lg shadow-sm hover:shadow-md h-full flex flex-col"
      onClick={onClick}
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-medium text-black group-hover:text-gray-700 transition-colors line-clamp-2">
            {note.title}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md flex-shrink-0 ml-2">
            {note.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
          {getPreview(note.content)}
        </p>

        <div className="flex justify-between items-center mt-auto">
          <div className="flex flex-wrap gap-1 max-w-[70%]">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border truncate max-w-[80px]"
                title={tag}
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{note.tags.length - 3}
              </span>
            )}
          </div>

          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}