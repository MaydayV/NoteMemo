'use client';

import { useState, useEffect } from 'react';
import { Note, NoteCategory } from '@/types/note';

interface NoteFormProps {
  note?: Note;
  categories: NoteCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function NoteForm({ note, categories, isOpen, onClose, onSave }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setTags(note.tags.join(', '));
    } else {
      // 默认值
      setTitle('');
      setContent('');
      setCategory(categories[0]?.name || '');
      setTags('');
    }
  }, [note, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    onSave({
      title,
      content,
      category,
      tags: tagArray,
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-light text-black">
            {note ? '编辑笔记' : '新建笔记'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* 标题 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                标题
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-0 focus:outline-none"
                required
              />
            </div>

            {/* 分类 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                分类
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-0 focus:outline-none"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 标签 */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                标签 (用逗号分隔)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="例如: nextjs, react, typescript"
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-0 focus:outline-none"
              />
            </div>

            {/* 内容 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                内容 (支持Markdown格式)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-0 focus:outline-none font-mono text-sm"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 mr-2 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white hover:bg-gray-800"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 