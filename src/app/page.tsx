'use client';

import { useState, useEffect, useMemo } from 'react';
import AuthGuard from '@/components/AuthGuard';
import SearchBar from '@/components/SearchBar';
import NoteCard from '@/components/NoteCard';
import NoteModal from '@/components/NoteModal';
import NoteForm from '@/components/NoteForm';
import CategoryModal from '@/components/CategoryModal';
import { Note, NoteCategory } from '@/types/note';
import { 
  getNotes, 
  getCategories, 
  searchAllNotes, 
  createNote, 
  updateNote, 
  deleteNote,
  saveCategories
} from '@/lib/notes';
import { setAuthenticated } from '@/lib/auth';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState<NoteCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const notesPerPage = 15; // 修改为每页15条笔记（5行，每行3条）

  useEffect(() => {
    const loadData = async () => {
      const notesData = await getNotes();
      const categoriesData = await getCategories();

      setNotes(notesData);
      setCategoryData(categoriesData);
      setCategories(['全部', ...categoriesData.map(cat => cat.name)]);
    };

    loadData();
  }, []);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // 如果有搜索查询，使用全局搜索
    if (searchQuery) {
      // 这里不能直接使用异步函数的结果
      // 我们已经在状态中存储了笔记，所以直接在这些笔记中搜索
      filtered = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    return filtered;
  }, [notes, selectedCategory, searchQuery]);

  // 计算总页数
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  // 获取当前页的笔记
  const currentNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * notesPerPage;
    return filteredNotes.slice(startIndex, startIndex + notesPerPage);
  }, [filteredNotes, currentPage, notesPerPage]);

  // 页码变化处理
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // 搜索或分类变化时，重置页码到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

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

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    const updatedNotes = await getNotes();
    setNotes(updatedNotes);
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      await updateNote(editingNote.id, noteData);
    } else {
      await createNote(noteData);
    }
    
    const updatedNotes = await getNotes();
    setNotes(updatedNotes);
    setIsFormOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategories = async (updatedCategories: NoteCategory[]) => {
    await saveCategories(updatedCategories);
    
    // 重新加载数据
    const categoriesData = await getCategories();
    setCategoryData(categoriesData);
    setCategories(['全部', ...categoriesData.map(cat => cat.name)]);
    
    // 重新加载笔记（因为可能有笔记的分类被更改）
    const updatedNotes = await getNotes();
    setNotes(updatedNotes);
  };

  // 分页组件
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-2 my-8 flex-wrap">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md border ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          上一页
        </button>
        
        <div className="flex flex-wrap justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 m-1 rounded-md ${
                currentPage === page
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md border ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          下一页
        </button>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 md:h-16">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-light text-black">NoteMemo</h1>
                <div className="flex md:hidden">
                  <button 
                    onClick={toggleSearch}
                    className="p-2 text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCreateNote}
                    className="p-2 text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className={`mt-4 md:mt-0 md:flex md:items-center md:space-x-4 ${isSearchExpanded ? 'block' : 'hidden md:flex'}`}>
                <div className="w-full md:w-auto mb-4 md:mb-0">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="搜索笔记..."
                  />
                </div>
                <div className="flex justify-between mt-4 md:mt-0">
                  <button
                    onClick={handleCreateNote}
                    className="hidden md:block px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-md"
                  >
                    新建笔记
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors rounded-md text-sm md:ml-4"
                  >
                    退出
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2 pb-2 whitespace-nowrap md:flex-wrap items-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-4 py-2 text-sm transition-colors border rounded-md
                      ${selectedCategory === category
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
                <button 
                  onClick={handleOpenCategoryModal}
                  className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:text-black hover:border-gray-400 transition-colors"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  管理
                </button>
              </div>
            </div>
          </div>

          {/* 搜索结果计数 */}
          {searchQuery && (
            <div className="mb-4 text-sm text-gray-500">
              找到 {filteredNotes.length} 条匹配的笔记
            </div>
          )}

          {/* Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {currentNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleNoteClick(note)}
              />
            ))}
          </div>

          {/* Pagination */}
          {filteredNotes.length > 0 && <Pagination />}

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
                className="mt-4 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-md"
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

        {/* Category Modal */}
        <CategoryModal
          categories={categoryData}
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategories}
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
