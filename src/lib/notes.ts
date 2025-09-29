import { Note, NoteCategory } from '@/types/note';
import { 
  isDbSyncEnabled, 
  getNotesFromDb, 
  saveNotesToDb, 
  getCategoriesFromDb, 
  saveCategoriesToDb,
  createNoteInDb,
  updateNoteInDb,
  deleteNoteFromDb,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryFromDb
} from './db';

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
    id: '0',
    title: 'NoteMemo 项目介绍',
    content: `# NoteMemo - 极简笔记备忘录

NoteMemo是一款基于Next.js开发的极简笔记应用，采用黑白极简设计风格，支持快速搜索和分类管理。

## 主要特点

- **极简设计** - 黑白配色，简洁优雅的用户界面
- **Markdown支持** - 所有笔记均支持Markdown格式
- **快速搜索** - 支持标题、内容、分类和标签搜索
- **分类管理** - 自定义分类，轻松整理笔记
- **数据同步** - 支持MongoDB数据库同步，跨设备访问
- **PWA支持** - 可安装到主屏幕，支持离线使用

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **构建工具**: Turbopack
- **部署**: Vercel
- **数据库**: MongoDB Atlas

## 开源信息

本项目开源于GitHub: [https://github.com/MaydayV/NoteMemo](https://github.com/MaydayV/NoteMemo)

欢迎提交Issue和Pull Request！`,
    category: '其他',
    tags: ['noteMemo', 'nextjs', 'project'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '1',
    title: '笔记管理与分类方法',
    content: `# NoteMemo 笔记管理指南

## 创建新笔记

1. 点击右上角的"新建笔记"按钮
2. 填写标题、内容（支持Markdown格式）
3. 选择分类或创建新分类
4. 添加标签（用逗号分隔）
5. 点击保存

## 编辑笔记

1. 在笔记列表中点击要编辑的笔记
2. 点击笔记详情页面中的"编辑"按钮
3. 修改内容后点击保存

## 删除笔记

1. 在笔记详情页面点击"删除"按钮
2. 确认删除操作

## 分类管理

### 查看分类

- 在主页左侧可以看到所有分类
- 点击分类可以筛选该分类下的笔记

### 创建新分类

1. 点击分类旁边的"+"按钮
2. 输入分类名称和描述
3. 点击保存

### 编辑分类

1. 点击"管理"按钮
2. 在分类管理界面中选择要编辑的分类
3. 修改名称或描述
4. 点击保存

### 删除分类

1. 在分类管理界面中选择要删除的分类
2. 点击删除按钮
3. 确认删除（注意：该分类下的笔记会被移动到"其他"分类）

## 搜索技巧

- 使用快捷键 Cmd/Ctrl + K 快速聚焦搜索框
- 搜索支持标题、内容、分类和标签
- 搜索结果实时显示，无需按回车`,
    category: '软件教程',
    tags: ['noteMemo', 'tutorial', 'notes-management'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Markdown 常见写法',
    content: `# Markdown 语法指南

## 基本语法

### 标题

\`\`\`
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
\`\`\`

### 强调

\`\`\`
*斜体* 或 _斜体_
**粗体** 或 __粗体__
***粗斜体*** 或 ___粗斜体___
\`\`\`

### 列表

无序列表:
\`\`\`
- 项目1
- 项目2
  - 子项目A
  - 子项目B
\`\`\`

有序列表:
\`\`\`
1. 第一项
2. 第二项
3. 第三项
\`\`\`

### 链接和图片

链接:
\`\`\`
[链接文字](https://www.example.com)
\`\`\`

图片:
\`\`\`
![替代文字](图片URL)
\`\`\`

## 高级语法

### 代码块

行内代码: \`code\`

代码块:
\`\`\`
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`
\`\`\`

### 表格

\`\`\`
| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 单元格 | 单元格 | 单元格 |
| 单元格 | 单元格 | 单元格 |
\`\`\`

### 引用

\`\`\`
> 这是一段引用文字
> 
> 这是引用的第二段
\`\`\`

### 分隔线

\`\`\`
---
\`\`\`

### 任务列表

\`\`\`
- [x] 已完成任务
- [ ] 未完成任务
\`\`\`

NoteMemo支持以上所有Markdown语法，让你的笔记更加丰富多彩！`,
    category: '软件教程',
    tags: ['markdown', 'tutorial', 'formatting'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Git 常用命令',
    content: `# Git 基本命令

## 初始化
\`\`\`bash
git init
git clone <repository>
\`\`\`

## 基本操作
\`\`\`bash
git add .
git commit -m "message"
git push origin main
git pull origin main
\`\`\`

## 分支操作
\`\`\`bash
git branch
git checkout -b <branch>
git merge <branch>
\`\`\``,
    category: '命令行工具',
    tags: ['git', 'version-control'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 本地存储 key
const NOTES_STORAGE_KEY = 'note-memo-notes';
const CATEGORIES_STORAGE_KEY = 'note-memo-categories';

// 获取所有笔记
export async function getNotes(): Promise<Note[]> {
  // 如果在服务器端运行，直接返回示例数据
  if (typeof window === 'undefined') return sampleNotes;

  // 检查是否启用数据库同步
  if (isDbSyncEnabled()) {
    try {
      // 尝试从数据库获取笔记
      const dbNotes = await getNotesFromDb();
      if (dbNotes && dbNotes.length > 0) {
        // 如果从数据库获取成功，同时更新本地存储
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(dbNotes));
        return dbNotes;
      }
    } catch (error) {
      console.error('从数据库获取笔记失败:', error);
      // 数据库获取失败，回退到本地存储
    }
  }

  // 从本地存储获取笔记
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // 如果没有存储的数据，使用示例数据并保存
    await saveNotes(sampleNotes);
    return sampleNotes;
  } catch (error) {
    console.error('Error loading notes:', error);
    return sampleNotes;
  }
}

// 保存笔记
export async function saveNotes(notes: Note[]): Promise<void> {
  if (typeof window === 'undefined') return;

  // 保存到本地存储
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to local storage:', error);
  }

  // 如果启用了数据库同步，也保存到数据库
  if (isDbSyncEnabled()) {
    try {
      await saveNotesToDb(notes);
    } catch (error) {
      console.error('Error saving notes to database:', error);
    }
  }
}

// 获取分类
export async function getCategories(): Promise<NoteCategory[]> {
  if (typeof window === 'undefined') return defaultCategories;

  // 检查是否启用数据库同步
  if (isDbSyncEnabled()) {
    try {
      // 尝试从数据库获取分类
      const dbCategories = await getCategoriesFromDb();
      if (dbCategories && dbCategories.length > 0) {
        // 如果从数据库获取成功，同时更新本地存储
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(dbCategories));
        return dbCategories;
      }
    } catch (error) {
      console.error('从数据库获取分类失败:', error);
      // 数据库获取失败，回退到本地存储
    }
  }

  // 从本地存储获取分类
  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    await saveCategories(defaultCategories);
    return defaultCategories;
  } catch (error) {
    console.error('Error loading categories:', error);
    return defaultCategories;
  }
}

// 保存分类
export async function saveCategories(categories: NoteCategory[]): Promise<void> {
  if (typeof window === 'undefined') return;

  // 保存到本地存储
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories to local storage:', error);
  }

  // 如果启用了数据库同步，也保存到数据库
  if (isDbSyncEnabled()) {
    try {
      await saveCategoriesToDb(categories);
    } catch (error) {
      console.error('Error saving categories to database:', error);
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
  
  // 如果启用了数据库同步，单独创建笔记到数据库
  if (isDbSyncEnabled()) {
    try {
      await createNoteInDb(newNote);
    } catch (error) {
      console.error('Error creating note in database:', error);
    }
  }
  
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
  
  // 如果启用了数据库同步，单独更新数据库中的笔记
  if (isDbSyncEnabled()) {
    try {
      await updateNoteInDb(id, {
        ...noteData,
        updatedAt: updatedNote.updatedAt
      });
    } catch (error) {
      console.error('Error updating note in database:', error);
    }
  }
  
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
  
  // 如果启用了数据库同步，单独从数据库中删除笔记
  if (isDbSyncEnabled()) {
    try {
      await deleteNoteFromDb(id);
    } catch (error) {
      console.error('Error deleting note from database:', error);
    }
  }
  
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
  
  // 如果启用了数据库同步，单独创建分类到数据库
  if (isDbSyncEnabled()) {
    try {
      await createCategoryInDb(newCategory);
    } catch (error) {
      console.error('Error creating category in database:', error);
    }
  }
  
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
  
  // 如果启用了数据库同步，单独更新数据库中的分类
  if (isDbSyncEnabled()) {
    try {
      await updateCategoryInDb(id, categoryData);
    } catch (error) {
      console.error('Error updating category in database:', error);
    }
  }
  
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
  
  // 如果启用了数据库同步，单独从数据库中删除分类
  if (isDbSyncEnabled()) {
    try {
      await deleteCategoryFromDb(id);
    } catch (error) {
      console.error('Error deleting category from database:', error);
    }
  }
  
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