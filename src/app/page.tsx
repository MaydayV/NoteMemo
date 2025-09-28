'use client';

import { useState, useEffect, useMemo } from 'react';
import AuthGuard from '@/components/AuthGuard';
import SearchBar from '@/components/SearchBar';
import NoteCard from '@/components/NoteCard';
import NoteModal from '@/components/NoteModal';
import NoteForm from '@/components/NoteForm';
import { Note } from '@/types/note';
import { getNotes, getCategories, searchNotes, createNote, updateNote, deleteNote } from '@/lib/notes';
import { setAuthenticated } from '@/lib/auth';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    const loadData = () => {
      const notesData = getNotes();
      const categoriesData = getCategories();

      setNotes(notesData);
      setCategories(['全部', ...categoriesData.map(cat => cat.name)]);
    };

    loadData();
  }, []);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // 按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    // 按搜索词筛选
    if (searchQuery) {
      filtered = searchNotes(filtered, searchQuery);
    }

    return filtered;
  }, [notes, selectedCategory, searchQuery]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    window.location.reload();
  };

  const handleCreateNote = () => {
    setEditingNote(undefined);
    setIsFormOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
    setIsModalOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setNotes(getNotes());
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      updateNote(editingNote.id, noteData);
    } else {
      createNote(noteData);
    }
    
    setNotes(getNotes());
    setIsFormOpen(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-light text-black">NoteMemo</h1>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="搜索笔记、分类或标签..."
                />
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  新建笔记
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  退出
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-2 text-sm transition-colors border
                    ${selectedCategory === category
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleNoteClick(note)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">
                {searchQuery || selectedCategory !== '全部'
                  ? '没有找到匹配的笔记'
                  : '暂无笔记'
                }
              </p>
              <button
                onClick={handleCreateNote}
                className="mt-4 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                创建第一条笔记
              </button>
            </div>
          )}
        </div>

        {/* Note Modal */}
        <NoteModal
          note={selectedNote}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />

        {/* Note Form Modal */}
        <NoteForm
          note={editingNote}
          categories={getCategories()}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveNote}
        />

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-gray-400">
              <p>NoteMemo - 极简笔记备忘录</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
