import { Note, NoteCategory } from '@/types/note';
import { 
  connectToDatabase, 
  getUserId, 
  getNotesCollection, 
  getCategoriesCollection 
} from './db';
import { getCurrentAccessCode } from './auth';

// 默认笔记分类
export const defaultCategories: NoteCategory[] = [
  { id: '1', name: '命令行工具', description: '常用命令行命令和工具' },
  { id: '2', name: '软件教程', description: '各种软件的使用教程' },
  { id: '3', name: '开发技巧', description: '编程和开发相关技巧' },
  { id: '4', name: '其他', description: '其他类型的笔记' }
];

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

// 示例笔记数据
export const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Git 常用命令',
    content: `# Git 基本命令

## 初始化
- git init
- git clone <repository>

## 基本操作
- git add .
- git commit -m "message"
- git push origin main
- git pull origin main

## 分支操作
- git branch
- git checkout -b <branch>
- git merge <branch>`,
    category: '命令行工具',
    tags: ['git', 'version-control'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Docker 基础命令',
    content: `# Docker 命令

## 镜像管理
- docker images
- docker pull <image>
- docker build -t <n> .

## 容器管理
- docker ps
- docker run -d <image>
- docker stop <container>
- docker rm <container>`,
    category: '命令行工具',
    tags: ['docker', 'containerization'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Next.js 部署到 Vercel',
    content: `# Next.js + Vercel 部署

## 准备工作
1. 确保项目根目录有 package.json
2. 推送代码到 GitHub

## 部署步骤
1. 登录 Vercel
2. 导入 GitHub 仓库
3. 配置环境变量
4. 部署

## 环境变量设置
- 在 Vercel Dashboard 中设置
- 或使用 .env.local 文件`,
    category: '软件教程',
    tags: ['nextjs', 'vercel', 'deployment'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 本地存储 key
const NOTES_STORAGE_KEY = 'note-memo-notes';
const CATEGORIES_STORAGE_KEY = 'note-memo-categories';

// 检查是否启用同步
function isSyncEnabled(): boolean {
  return process.env.ENABLE_SYNC === 'true';
}

// 获取当前用户ID
async function getCurrentUserId(): Promise<string | null> {
  const accessCode = getCurrentAccessCode();
  if (!accessCode) return null;
  
  return await getUserId(accessCode);
}

// 获取所有笔记
export async function getNotes(): Promise<Note[]> {
  // 如果启用了同步且在客户端环境
  if (isSyncEnabled() && typeof window !== 'undefined') {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return getLocalNotes();
      
      const notesCollection = await getNotesCollection(userId);
      if (!notesCollection) return getLocalNotes();
      
      // 从数据库获取笔记
      const dbNotes = await notesCollection.find({}).toArray();
      
      // 如果数据库中有笔记，则返回
      if (dbNotes && dbNotes.length > 0) {
        // 转换MongoDB文档为Note对象
        const notes = dbNotes.map(note => ({
          id: note._id.toString(),
          title: note.title,
          content: note.content,
          category: note.category,
          tags: note.tags || [],
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }));
        
        // 更新本地存储以便离线访问
        saveLocalNotes(notes);
        return notes;
      }
      
      // 如果数据库中没有笔记，则使用本地笔记并同步到数据库
      const localNotes = getLocalNotes();
      await syncNotesToDb(localNotes, userId);
      return localNotes;
    } catch (error) {
      console.error('从数据库获取笔记失败:', error);
      return getLocalNotes();
    }
  }
  
  // 如果未启用同步或在服务器端，使用本地存储
  return getLocalNotes();
}

// 从本地存储获取笔记
function getLocalNotes(): Note[] {
  if (typeof window === 'undefined') return sampleNotes;

  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // 如果没有存储的数据，使用示例数据并保存
    saveLocalNotes(sampleNotes);
    return sampleNotes;
  } catch (error) {
    console.error('Error loading notes:', error);
    return sampleNotes;
  }
}

// 保存笔记到本地存储
function saveLocalNotes(notes: Note[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

// 同步笔记到数据库
async function syncNotesToDb(notes: Note[], userId: string): Promise<void> {
  if (!isSyncEnabled()) return;
  
  try {
    const notesCollection = await getNotesCollection(userId);
    if (!notesCollection) return;
    
    // 清空现有笔记并插入新笔记
    await notesCollection.deleteMany({});
    
    if (notes.length > 0) {
      // 转换Note对象为MongoDB文档
      const dbNotes = notes.map(note => ({
        _id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }));
      
      await notesCollection.insertMany(dbNotes);
    }
  } catch (error) {
    console.error('同步笔记到数据库失败:', error);
  }
}

// 保存笔记
export async function saveNotes(notes: Note[]): Promise<void> {
  // 保存到本地存储
  saveLocalNotes(notes);
  
  // 如果启用了同步，也保存到数据库
  if (isSyncEnabled() && typeof window !== 'undefined') {
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        await syncNotesToDb(notes, userId);
      }
    } catch (error) {
      console.error('保存笔记到数据库失败:', error);
    }
  }
}

// 获取分类
export async function getCategories(): Promise<NoteCategory[]> {
  // 如果启用了同步且在客户端环境
  if (isSyncEnabled() && typeof window !== 'undefined') {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return getLocalCategories();
      
      const categoriesCollection = await getCategoriesCollection(userId);
      if (!categoriesCollection) return getLocalCategories();
      
      // 从数据库获取分类
      const dbCategories = await categoriesCollection.find({}).toArray();
      
      // 如果数据库中有分类，则返回
      if (dbCategories && dbCategories.length > 0) {
        // 转换MongoDB文档为NoteCategory对象
        const categories = dbCategories.map(category => ({
          id: category._id.toString(),
          name: category.name,
          description: category.description
        }));
        
        // 更新本地存储以便离线访问
        saveLocalCategories(categories);
        return categories;
      }
      
      // 如果数据库中没有分类，则使用本地分类并同步到数据库
      const localCategories = getLocalCategories();
      await syncCategoriesToDb(localCategories, userId);
      return localCategories;
    } catch (error) {
      console.error('从数据库获取分类失败:', error);
      return getLocalCategories();
    }
  }
  
  // 如果未启用同步或在服务器端，使用本地存储
  return getLocalCategories();
}

// 从本地存储获取分类
function getLocalCategories(): NoteCategory[] {
  if (typeof window === 'undefined') return defaultCategories;

  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    saveLocalCategories(defaultCategories);
    return defaultCategories;
  } catch (error) {
    console.error('Error loading categories:', error);
    return defaultCategories;
  }
}

// 保存分类到本地存储
function saveLocalCategories(categories: NoteCategory[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
}

// 同步分类到数据库
async function syncCategoriesToDb(categories: NoteCategory[], userId: string): Promise<void> {
  if (!isSyncEnabled()) return;
  
  try {
    const categoriesCollection = await getCategoriesCollection(userId);
    if (!categoriesCollection) return;
    
    // 清空现有分类并插入新分类
    await categoriesCollection.deleteMany({});
    
    if (categories.length > 0) {
      // 转换NoteCategory对象为MongoDB文档
      const dbCategories = categories.map(category => ({
        _id: category.id,
        name: category.name,
        description: category.description
      }));
      
      await categoriesCollection.insertMany(dbCategories);
    }
  } catch (error) {
    console.error('同步分类到数据库失败:', error);
  }
}

// 保存分类
export async function saveCategories(categories: NoteCategory[]): Promise<void> {
  // 保存到本地存储
  saveLocalCategories(categories);
  
  // 如果启用了同步，也保存到数据库
  if (isSyncEnabled() && typeof window !== 'undefined') {
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        await syncCategoriesToDb(categories, userId);
      }
    } catch (error) {
      console.error('保存分类到数据库失败:', error);
    }
  }
}

// 搜索笔记
export function searchNotes(notes: Note[], query: string): Note[] {
  if (!query.trim()) return notes;

  const lowercaseQuery = query.toLowerCase();
  return notes.filter(note =>
    note.title.toLowerCase().includes(lowercaseQuery) ||
    note.content.toLowerCase().includes(lowercaseQuery) ||
    note.category.toLowerCase().includes(lowercaseQuery) ||
    note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// 全局搜索所有笔记
export async function searchAllNotes(query: string): Promise<Note[]> {
  const allNotes = await getNotes();
  
  if (!query.trim()) return allNotes;
  
  const lowercaseQuery = query.toLowerCase();
  return allNotes.filter(note =>
    note.title.toLowerCase().includes(lowercaseQuery) ||
    note.content.toLowerCase().includes(lowercaseQuery) ||
    note.category.toLowerCase().includes(lowercaseQuery) ||
    note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// 创建新笔记
export async function createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  const notes = await getNotes();
  
  const newNote: Note = {
    ...noteData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const updatedNotes = [newNote, ...notes];
  await saveNotes(updatedNotes);
  
  return newNote;
}

// 更新笔记
export async function updateNote(id: string, noteData: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note | null> {
  const notes = await getNotes();
  const noteIndex = notes.findIndex(note => note.id === id);
  
  if (noteIndex === -1) return null;
  
  const updatedNote: Note = {
    ...notes[noteIndex],
    ...noteData,
    updatedAt: new Date().toISOString(),
  };
  
  notes[noteIndex] = updatedNote;
  await saveNotes(notes);
  
  return updatedNote;
}

// 删除笔记
export async function deleteNote(id: string): Promise<boolean> {
  const notes = await getNotes();
  const filteredNotes = notes.filter(note => note.id !== id);
  
  if (filteredNotes.length === notes.length) {
    return false; // 没有找到要删除的笔记
  }
  
  await saveNotes(filteredNotes);
  return true;
}

// 创建新分类
export async function createCategory(categoryData: Omit<NoteCategory, 'id'>): Promise<NoteCategory> {
  const categories = await getCategories();
  
  const newCategory: NoteCategory = {
    ...categoryData,
    id: generateId()
  };
  
  const updatedCategories = [...categories, newCategory];
  await saveCategories(updatedCategories);
  
  return newCategory;
}

// 更新分类
export async function updateCategory(id: string, categoryData: Partial<Omit<NoteCategory, 'id'>>): Promise<NoteCategory | null> {
  const categories = await getCategories();
  const categoryIndex = categories.findIndex(category => category.id === id);
  
  if (categoryIndex === -1) return null;
  
  const updatedCategory: NoteCategory = {
    ...categories[categoryIndex],
    ...categoryData
  };
  
  categories[categoryIndex] = updatedCategory;
  await saveCategories(categories);
  
  // 如果修改了分类名称，同时更新所有使用该分类的笔记
  if (categoryData.name && categoryData.name !== categories[categoryIndex].name) {
    const oldName = categories[categoryIndex].name;
    const newName = categoryData.name;
    await updateNotesCategory(oldName, newName);
  }
  
  return updatedCategory;
}

// 删除分类
export async function deleteCategory(id: string): Promise<boolean> {
  const categories = await getCategories();
  const categoryToDelete = categories.find(category => category.id === id);
  
  if (!categoryToDelete) return false;
  
  // 不允许删除"其他"分类
  if (categoryToDelete.name === '其他') return false;
  
  const filteredCategories = categories.filter(category => category.id !== id);
  
  if (filteredCategories.length === categories.length) {
    return false; // 没有找到要删除的分类
  }
  
  await saveCategories(filteredCategories);
  
  // 将使用已删除分类的笔记移动到"其他"分类
  await moveNotesToOtherCategory(categoryToDelete.name);
  
  return true;
}

// 将使用已删除分类的笔记移动到"其他"分类
async function moveNotesToOtherCategory(categoryName: string): Promise<void> {
  const notes = await getNotes();
  const updatedNotes = notes.map(note => {
    if (note.category === categoryName) {
      return { ...note, category: '其他', updatedAt: new Date().toISOString() };
    }
    return note;
  });
  
  await saveNotes(updatedNotes);
}

// 更新笔记的分类名称
async function updateNotesCategory(oldCategoryName: string, newCategoryName: string): Promise<void> {
  const notes = await getNotes();
  const updatedNotes = notes.map(note => {
    if (note.category === oldCategoryName) {
      return { ...note, category: newCategoryName, updatedAt: new Date().toISOString() };
    }
    return note;
  });
  
  await saveNotes(updatedNotes);
}