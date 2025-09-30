'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import AuthGuard from '@/components/AuthGuard';
import SearchBar from '@/components/SearchBar';
import NoteCard from '@/components/NoteCard';
import NoteModal from '@/components/NoteModal';
import NoteForm from '@/components/NoteForm';
import CategoryModal from '@/components/CategoryModal';
import SyncStatus from '@/components/SyncStatus';
import { Note, NoteCategory } from '@/types/note';
import { 
  getNotes, 
  getCategories, 
  searchAllNotes, 
  createNote, 
  updateNote, 
  deleteNote,
  saveCategories,
  saveNotes
} from '@/lib/notes';
import { setAuthenticated } from '@/lib/auth';

// 导入/导出数据类型
interface ExportData {
  notes: Note[];
  categories: NoteCategory[];
  version: string;
  exportDate: string;
}

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
  const [isLoading, setIsLoading] = useState(true); // 添加加载状态
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notesPerPage = 15; // 修改为每页15条笔记（5行，每行3条）

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // 开始加载前设置加载状态
      try {
        const notesData = await getNotes();
        const categoriesData = await getCategories();

        setNotes(notesData);
        setCategoryData(categoriesData);
        setCategories(['全部', ...categoriesData.map(cat => cat.name)]);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setIsLoading(false); // 无论成功或失败，都结束加载状态
      }
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

  // 导出数据
  const handleExportData = async () => {
    setExportStatus('exporting');
    try {
      // 准备导出数据
      const exportData: ExportData = {
        notes: notes,
        categories: categoryData,
        version: '1.0',
        exportDate: new Date().toISOString()
      };

      // 转换为JSON字符串
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // 创建Blob
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 设置文件名 (格式: notememo_backup_YYYY-MM-DD.json)
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      link.download = `notememo_backup_${date}.json`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportStatus('success');
      
      // 3秒后重置状态
      setTimeout(() => {
        setExportStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('导出数据失败:', error);
      setExportStatus('error');
      
      // 3秒后重置状态
      setTimeout(() => {
        setExportStatus('idle');
      }, 3000);
    }
  };

  // 触发文件选择
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 导入数据
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportStatus('importing');
    
    try {
      // 读取文件
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content) as ExportData;
          
          // 验证导入数据格式
          if (!importData.notes || !Array.isArray(importData.notes) || 
              !importData.categories || !Array.isArray(importData.categories)) {
            throw new Error('导入文件格式不正确');
          }
          
          // 确认导入
          if (window.confirm(`确定要导入 ${importData.notes.length} 条笔记和 ${importData.categories.length} 个分类吗？这将覆盖当前数据。`)) {
            // 保存导入的分类和笔记
            await saveCategories(importData.categories);
            await saveNotes(importData.notes);
            
            // 重新加载数据
            const notesData = await getNotes();
            const categoriesData = await getCategories();
            
            setNotes(notesData);
            setCategoryData(categoriesData);
            setCategories(['全部', ...categoriesData.map(cat => cat.name)]);
            
            setImportStatus('success');
            
            // 3秒后重置状态
            setTimeout(() => {
              setImportStatus('idle');
            }, 3000);
          } else {
            setImportStatus('idle');
          }
        } catch (error) {
          console.error('解析导入文件失败:', error);
          setImportError('导入文件格式不正确');
          setImportStatus('error');
          
          // 3秒后重置状态
          setTimeout(() => {
            setImportStatus('idle');
            setImportError(null);
          }, 3000);
        }
      };
      
      reader.onerror = () => {
        setImportError('读取文件失败');
        setImportStatus('error');
        
        // 3秒后重置状态
        setTimeout(() => {
          setImportStatus('idle');
          setImportError(null);
        }, 3000);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入数据失败:', error);
      setImportError('导入数据失败');
      setImportStatus('error');
      
      // 3秒后重置状态
      setTimeout(() => {
        setImportStatus('idle');
        setImportError(null);
      }, 3000);
    }
    
    // 重置文件输入，以便再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors rounded-md text-sm md:ml-2"
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
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="col-span-full text-center py-12">
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
            ) : (
              currentNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onClick={() => handleNoteClick(note)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredNotes.length > 0 && <Pagination />}

          {/* 删除重复的空状态提示，因为已经在Notes Grid中显示了 */}
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
          categories={categoryData}
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
              <p>
                <a href="https://github.com/MaydayV" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  © MaydayV
                </a> • 
                <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="hover:underline ml-1">
                  MIT License
                </a>
              </p>
              
              {/* 数据导入/导出按钮 */}
              <div className="flex justify-center space-x-4 mt-3 mb-2">
                <button
                  onClick={handleExportData}
                  disabled={exportStatus === 'exporting'}
                  className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {exportStatus === 'exporting' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      导出中...
                    </>
                  ) : exportStatus === 'success' ? (
                    <>
                      <svg className="h-3 w-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      导出成功
                    </>
                  ) : exportStatus === 'error' ? (
                    <>
                      <svg className="h-3 w-3 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      导出失败
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      导出数据
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleImportClick}
                  disabled={importStatus === 'importing'}
                  className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {importStatus === 'importing' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      导入中...
                    </>
                  ) : importStatus === 'success' ? (
                    <>
                      <svg className="h-3 w-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      导入成功
                    </>
                  ) : importStatus === 'error' ? (
                    <>
                      <svg className="h-3 w-3 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      导入失败
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      导入数据
                    </>
                  )}
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </div>
              
              {importError && (
                <p className="text-xs text-red-500 mb-2">{importError}</p>
              )}
              
              <SyncStatus className="mt-2 justify-center" />
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
