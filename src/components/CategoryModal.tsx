'use client';

import { useState, useEffect } from 'react';
import { NoteCategory } from '@/types/note';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categories: NoteCategory[]) => void;
  categories: NoteCategory[];
}

export default function CategoryModal({ isOpen, onClose, onSave, categories: initialCategories }: CategoryModalProps) {
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<NoteCategory | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  if (!isOpen) return null;

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: NoteCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || undefined
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  const handleEditCategory = (category: NoteCategory) => {
    setEditingCategory({ ...category });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    setCategories(
      categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...editingCategory, name: editingCategory.name.trim(), description: editingCategory.description?.trim() } 
          : cat
      )
    );
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    // 检查是否是"其他"分类，不允许删除
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (categoryToDelete?.name === '其他') {
      alert('不能删除"其他"分类');
      return;
    }
    
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleSave = () => {
    try {
      onSave(categories);
      onClose();
    } catch (error) {
      console.error('保存分类时出错:', error);
      alert('保存分类失败，请重试');
    }
  };

  // 分类排序功能
  const moveCategory = (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) return;

    // 不能移动第一个向上或最后一个向下
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === categories.length - 1)) {
      return;
    }

    const newCategories = [...categories];
    const offset = direction === 'up' ? -1 : 1;
    
    // 交换位置
    [newCategories[index], newCategories[index + offset]] = 
    [newCategories[index + offset], newCategories[index]];
    
    setCategories(newCategories);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-35 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-medium mb-4">管理分类</h2>
        
        {/* 添加新分类 */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-md font-medium mb-2">添加新分类</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="分类名称"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
            <input
              type="text"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="分类描述（可选）"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 bg-black text-white rounded-md disabled:bg-gray-300"
            >
              添加
            </button>
          </div>
        </div>
        
        {/* 现有分类列表 */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">现有分类</h3>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div key={category.id} className="flex items-center justify-between border rounded-md p-3">
                <div className="flex-1">
                  <div className="font-medium">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-gray-500">{category.description}</div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col mr-2">
                    <button
                      onClick={() => moveCategory(category.id, 'up')}
                      disabled={index === 0}
                      className={`text-gray-400 ${index !== 0 ? 'hover:text-gray-600' : ''} p-0.5`}
                      title="上移"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveCategory(category.id, 'down')}
                      disabled={index === categories.length - 1}
                      className={`text-gray-400 ${index !== categories.length - 1 ? 'hover:text-gray-600' : ''} p-0.5`}
                      title="下移"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {category.name !== '其他' && (
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 编辑分类模态框 */}
        {editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-35 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-medium mb-4">编辑分类</h3>
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="分类名称"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  disabled={editingCategory.name === '其他'} // 不允许修改"其他"分类的名称
                />
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="分类描述（可选）"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={!editingCategory.name.trim()}
                  className="px-4 py-2 bg-black text-white rounded-md disabled:bg-gray-300"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 底部按钮 */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
} 