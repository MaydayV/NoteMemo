import { Note, NoteCategory } from '@/types/note';

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

// 获取所有笔记
export function getNotes(): Note[] {
  if (typeof window === 'undefined') return sampleNotes;

  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // 如果没有存储的数据，使用示例数据并保存
    saveNotes(sampleNotes);
    return sampleNotes;
  } catch (error) {
    console.error('Error loading notes:', error);
    return sampleNotes;
  }
}

// 保存笔记
export function saveNotes(notes: Note[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

// 获取分类
export function getCategories(): NoteCategory[] {
  if (typeof window === 'undefined') return defaultCategories;

  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    saveCategories(defaultCategories);
    return defaultCategories;
  } catch (error) {
    console.error('Error loading categories:', error);
    return defaultCategories;
  }
}

// 保存分类
export function saveCategories(categories: NoteCategory[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
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

// 创建新笔记
export function createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const notes = getNotes();
  
  const newNote: Note = {
    ...noteData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const updatedNotes = [newNote, ...notes];
  saveNotes(updatedNotes);
  
  return newNote;
}

// 更新笔记
export function updateNote(id: string, noteData: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | null {
  const notes = getNotes();
  const noteIndex = notes.findIndex(note => note.id === id);
  
  if (noteIndex === -1) return null;
  
  const updatedNote: Note = {
    ...notes[noteIndex],
    ...noteData,
    updatedAt: new Date().toISOString(),
  };
  
  notes[noteIndex] = updatedNote;
  saveNotes(notes);
  
  return updatedNote;
}

// 删除笔记
export function deleteNote(id: string): boolean {
  const notes = getNotes();
  const filteredNotes = notes.filter(note => note.id !== id);
  
  if (filteredNotes.length === notes.length) {
    return false; // 没有找到要删除的笔记
  }
  
  saveNotes(filteredNotes);
  return true;
}