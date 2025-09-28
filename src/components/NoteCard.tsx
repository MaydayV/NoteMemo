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
    const plainText = content.replace(/[#*`\n]/g, ' ').replace(/\s+/g, ' ').trim();
    return plainText.length > maxLength
      ? plainText.slice(0, maxLength) + '...'
      : plainText;
  };

  return (
    <div
      className="border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer group bg-white rounded-lg shadow-sm hover:shadow-md"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-medium text-black group-hover:text-gray-700 transition-colors">
            {note.title}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            {note.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {getPreview(note.content)}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border"
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

          <span className="text-xs text-gray-400">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}