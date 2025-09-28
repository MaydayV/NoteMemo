'use client';

import { Note } from '@/types/note';

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
}

export default function NoteModal({ note, isOpen, onClose, onEdit, onDelete }: NoteModalProps) {
  if (!isOpen || !note) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // 处理标题
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-xl font-semibold text-black mb-3 mt-6 first:mt-0">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-lg font-medium text-black mb-2 mt-4 first:mt-0">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-base font-medium text-black mb-2 mt-3 first:mt-0">
            {line.slice(4)}
          </h3>
        );
      }

      // 处理代码行
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={index} className="ml-4 mb-1">
            <span className="text-gray-700">{line.slice(2)}</span>
          </div>
        );
      }

      // 处理空行
      if (line.trim() === '') {
        return <div key={index} className="h-3" />;
      }

      // 普通文本
      return (
        <p key={index} className="text-gray-700 mb-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  const handleEdit = () => {
    if (onEdit && note) {
      onEdit(note);
    }
  };

  const handleDelete = () => {
    if (onDelete && note) {
      if (window.confirm(`确定要删除笔记 "${note.title}" 吗？`)) {
        onDelete(note.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex-1 mr-4">
            <h2 className="text-2xl font-light text-black mb-2">{note.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">{note.category}</span>
              <span>更新于 {formatDate(note.updatedAt)}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="编辑"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="删除"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="关闭"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            {formatContent(note.content)}
          </div>
        </div>

        {/* Footer */}
        {note.tags.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}