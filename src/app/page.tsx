'use client';

import { useState, useEffect, useMemo } from 'react';
import AuthGuard from '@/components/AuthGuard';
import SearchBar from '@/components/SearchBar';
import NoteCard from '@/components/NoteCard';
import NoteModal from '@/components/NoteModal';
import NoteForm from '@/components/NoteForm';
import CategoryModal from '@/components/CategoryModal';
import SyncToggle from '@/components/SyncToggle';
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
      try {
        const notesData = await getNotes();
        const categoriesData = await getCategories();
        
        setNotes(notesData);
        setCategoryData(categoriesData);
        setCategories(['全部', ...categoriesData.map(cat => cat.name)]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // 如果有搜索查询，使用全局搜索
    if (searchQuery) {
      // 由于searchAllNotes是异步的，我们不能在useMemo中使用await
      // 这里直接使用本地过滤
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = notes.filter(note =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        note.category.toLowerCase().includes(lowercaseQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }

    // 按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    return filtered;
  }, [notes, searchQuery, selectedCategory]);

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
    
    const newCategories = await getCategories();
    setCategoryData(newCategories);
    setCategories(['全部', ...newCategories.map(cat => cat.name)]);
    
    // 重新加载笔记以反映分类变化
    const updatedNotes = await getNotes();
    setNotes(updatedNotes);
    
    setIsCategoryModalOpen(false);
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">NoteMemo</h1>
            <p className="text-gray-600">极简笔记备忘录</p>
          </div>
          <div className="flex mt-4 md:mt-0">
            <button
              onClick={handleCreateNote}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors mr-2"
            >
              新建笔记
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              退出
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-64 mb-6 md:mb-0 md:mr-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">分类</h2>
              <button
                onClick={handleOpenCategoryModal}
                className="text-sm text-gray-600 hover:text-black"
              >
                管理
              </button>
            </div>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      selectedCategory === category
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="flex-1">
            <div className="mb-6">
              <div className="mb-4">
                <SearchBar 
                  value={searchQuery} 
                  onChange={setSearchQuery} 
                  placeholder="搜索笔记..."
                />
                <SyncToggle />
              </div>
              <div className="flex justify-between mt-4 md:mt-0">
                <h2 className="text-xl font-bold">
                  {selectedCategory === '全部' ? '所有笔记' : selectedCategory}
                </h2>
                <span className="text-gray-500">{filteredNotes.length} 条笔记</span>
              </div>
            </div>

            {currentNotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">没有找到笔记</p>
                <button
                  onClick={handleCreateNote}
                  className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  创建第一条笔记
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => handleNoteClick(note)}
                    />
                  ))}
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-md mr-2 disabled:opacity-50"
                      >
                        上一页
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-8 h-8 mx-1 rounded-md ${
                            currentPage === i + 1
                              ? 'bg-black text-white'
                              : 'border hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-md ml-2 disabled:opacity-50"
                      >
                        下一页
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {isModalOpen && selectedNote && (
          <NoteModal
            note={selectedNote}
            onClose={() => setIsModalOpen(false)}
            onEdit={() => handleEditNote(selectedNote)}
            onDelete={() => {
              handleDeleteNote(selectedNote.id);
              setIsModalOpen(false);
            }}
          />
        )}

        {isFormOpen && (
          <NoteForm
            note={editingNote}
            categories={categoryData}
            onSave={handleSaveNote}
            onCancel={() => setIsFormOpen(false)}
          />
        )}

        {isCategoryModalOpen && (
          <CategoryModal
            categories={categoryData}
            onSave={handleSaveCategories}
            onCancel={() => setIsCategoryModalOpen(false)}
          />
        )}
      </div>
    </AuthGuard>
  );
}
