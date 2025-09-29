import { Note, NoteCategory } from '@/types/note';
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
    id: '0',
    title: 'NoteMemo 项目介绍',
    content: `# NoteMemo - 极简笔记备忘录

NoteMemo是一款基于Next.js开发的极简笔记应用，采用黑白极简设计风格，支持快速搜索和分类管理。

## 主要特点

- **极简设计** - 黑白配色，简洁优雅的用户界面
- **Markdown支持** - 所有笔记均支持Markdown格式
- **快速搜索** - 支持标题、内容、分类和标签搜索
- **分类管理** - 自定义分类，轻松整理笔记
- **本地存储** - 数据保存在浏览器本地，无需数据库
- **PWA支持** - 可安装到主屏幕，支持离线使用

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **构建工具**: Turbopack
- **部署**: Vercel

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

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
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
const LAST_SYNC_KEY = 'note-memo-last-sync';

// 检查是否启用同步
function isSyncEnabled(): boolean {
  return process.env.ENABLE_SYNC === 'true';
}

// 保存最后同步时间到本地
function saveLastSyncTime(time: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_SYNC_KEY, time);
}

// 获取本地保存的最后同步时间
function getLocalLastSyncTime(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_SYNC_KEY);
}

// 获取所有笔记
export async function getNotes(): Promise<Note[]> {
  // 如果在服务器端，返回示例笔记
  if (typeof window === 'undefined') return sampleNotes;
  
  // 首先获取本地笔记，确保有数据可显示
  const localNotes = getLocalNotes();
  
  // 如果启用了同步
  if (isSyncEnabled()) {
    try {
      const accessCode = getCurrentAccessCode();
      if (!accessCode) return localNotes;
      
      // 设置超时，确保不会无限等待
      const syncPromise = async () => {
        // 获取最后同步时间
        const localLastSyncTime = getLocalLastSyncTime();
        
        // 如果有最后同步时间，获取自那时以来的更新
        if (localLastSyncTime) {
          console.log(`获取自 ${localLastSyncTime} 以来的更新`);
          // 从服务器获取最近更新的笔记
          const response = await fetch(`/api/notes?since=${encodeURIComponent(localLastSyncTime)}`, {
            headers: {
              'x-access-code': accessCode
            }
          });
          
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          
          const recentNotes: Note[] = await response.json();
          console.log(`从服务器获取到 ${recentNotes.length} 条更新的笔记`);
          
          if (recentNotes.length > 0) {
            // 确保每个笔记都有唯一ID
            recentNotes.forEach(note => {
              if (!note.id) {
                console.error('服务器返回的笔记缺少ID:', note);
              }
            });
            
            // 合并本地和服务器笔记，以服务器为准（更新时间较新的优先）
            const mergedNotes = mergeNotes(localNotes, recentNotes);
            
            // 更新本地存储
            saveLocalNotes(mergedNotes);
            
            // 将合并后的笔记同步回服务器
            await syncNotesToServer(mergedNotes);
            
            return mergedNotes;
          }
        } else {
          // 如果没有最后同步时间，从服务器获取所有笔记
          const response = await fetch('/api/notes', {
            headers: {
              'x-access-code': accessCode
            }
          });
          
          if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
          }
          
          const serverNotes: Note[] = await response.json();
          console.log(`从服务器获取到 ${serverNotes.length} 条笔记`);
          
          if (serverNotes.length > 0) {
            // 确保每个笔记都有唯一ID
            serverNotes.forEach(note => {
              if (!note.id) {
                console.error('服务器返回的笔记缺少ID:', note);
              }
            });
            
            // 合并本地和服务器笔记
            const mergedNotes = mergeNotes(localNotes, serverNotes);
            
            // 更新本地存储
            saveLocalNotes(mergedNotes);
            
            // 更新同步时间
            const now = new Date().toISOString();
            saveLastSyncTime(now);
            
            return mergedNotes;
          }
        }
        
        return localNotes;
      };
      
      // 设置超时，最多等待5秒
      const timeoutPromise = new Promise<Note[]>((resolve) => {
        setTimeout(() => {
          console.log('同步超时，使用本地笔记');
          resolve(localNotes);
        }, 5000);
      });
      
      // 使用Promise.race确保不会无限等待
      return Promise.race([syncPromise(), timeoutPromise]);
    } catch (error) {
      console.error('从服务器获取笔记失败:', error);
      // 如果同步失败，回退到本地笔记
    }
  }
  
  return localNotes;
}

// 合并笔记，处理冲突
function mergeNotes(localNotes: Note[], serverNotes: Note[]): Note[] {
  // 获取所有本地笔记，包括已删除的
  const allLocalNotes = getAllLocalNotes();
  
  // 创建一个ID到笔记的映射，方便查找
  const noteMap = new Map<string, Note>();
  
  // 先添加所有本地笔记（包括已删除的）
  allLocalNotes.forEach(note => {
    noteMap.set(note.id, note);
  });
  
  // 然后添加或更新服务器笔记（如果时间戳更新）
  serverNotes.forEach(serverNote => {
    const localNote = noteMap.get(serverNote.id);
    
    // 如果本地没有这个笔记，或者服务器笔记更新时间更晚，使用服务器笔记
    if (!localNote || new Date(serverNote.updatedAt) > new Date(localNote.updatedAt)) {
      console.log(`使用服务器笔记: ${serverNote.id} - ${serverNote.title} ${serverNote.deleted ? '(已删除)' : ''}`);
      noteMap.set(serverNote.id, serverNote);
    } else {
      console.log(`保留本地笔记: ${localNote.id} - ${localNote.title} ${localNote.deleted ? '(已删除)' : ''}`);
    }
  });
  
  // 转换回数组并按更新时间排序（最新的在前）
  const allMergedNotes = Array.from(noteMap.values())
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // 保存所有合并的笔记到本地存储
  saveLocalNotes(allMergedNotes);
  
  // 返回过滤掉已删除笔记的列表
  return allMergedNotes.filter(note => !note.deleted);
}

// 从本地存储获取笔记
function getLocalNotes(): Note[] {
  if (typeof window === 'undefined') return sampleNotes;

  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      // 获取所有笔记，但过滤掉已删除的笔记
      const allNotes = JSON.parse(stored);
      return allNotes.filter((note: Note) => !note.deleted);
    }
    saveLocalNotes(sampleNotes);
    return sampleNotes;
  } catch (error) {
    console.error('Error loading notes:', error);
    return sampleNotes;
  }
}

// 从本地存储获取所有笔记，包括已删除的
function getAllLocalNotes(): Note[] {
  if (typeof window === 'undefined') return sampleNotes;

  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return sampleNotes;
  } catch (error) {
    console.error('Error loading all notes:', error);
    return sampleNotes;
  }
}

// 保存笔记到本地存储
function saveLocalNotes(notes: Note[]): void {
  if (typeof window === 'undefined') return;

  try {
    // 获取当前所有笔记（包括已删除的）
    const currentNotes = getAllLocalNotes();
    
    // 创建一个ID到笔记的映射，方便查找和更新
    const noteMap = new Map<string, Note>();
    
    // 添加当前所有笔记
    currentNotes.forEach(note => {
      noteMap.set(note.id, note);
    });
    
    // 更新或添加新的笔记
    notes.forEach(note => {
      noteMap.set(note.id, note);
    });
    
    // 转换回数组并保存
    const allNotes = Array.from(noteMap.values());
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(allNotes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

// 同步笔记到服务器
async function syncNotesToServer(notes: Note[]): Promise<void> {
  if (!isSyncEnabled() || typeof window === 'undefined') return;
  
  const accessCode = getCurrentAccessCode();
  if (!accessCode) return;
  
  try {
    console.log('尝试同步笔记到服务器...');
    
    // 获取本地最后同步时间
    const localLastSyncTime = getLocalLastSyncTime();
    
    // 获取所有笔记，包括已删除的
    const allNotes = getAllLocalNotes();
    
    // 如果有最后同步时间，只同步此时间之后更新的笔记（包括已删除的）
    let notesToSync = allNotes;
    if (localLastSyncTime) {
      const lastSyncDate = new Date(localLastSyncTime);
      notesToSync = allNotes.filter(note => {
        const updateDate = new Date(note.updatedAt);
        return updateDate > lastSyncDate;
      });
      console.log(`筛选出 ${notesToSync.length} 条需要同步的笔记（共 ${allNotes.length} 条，包括已删除）`);
    }
    
    // 如果没有需要同步的笔记，直接返回
    if (notesToSync.length === 0) {
      console.log('没有需要同步的笔记');
      return;
    }
    
    // 检查是否为开发环境
    const isDev = process.env.IS_DEV === 'true';
    
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-code': accessCode
      },
      body: JSON.stringify(notesToSync)
    });
    
    if (!response.ok) {
      // 在开发环境中，如果没有配置MongoDB，只记录信息而不抛出错误
      if (isDev) {
        console.log(`开发环境: 服务器响应错误 ${response.status}，这可能是因为未配置MongoDB。`);
        console.log('这不会影响本地存储功能，只有多设备同步功能不可用。');
        return;
      } else {
        throw new Error(`服务器响应错误: ${response.status}`);
      }
    }
    
    const result = await response.json();
    
    // 保存同步时间
    if (result.syncTime) {
      saveLastSyncTime(result.syncTime);
    }
    
    console.log('笔记同步成功');
  } catch (error) {
    // 在开发环境中，如果是连接错误，只显示简化的消息
    if (process.env.IS_DEV === 'true') {
      console.log('开发环境: 同步笔记到服务器失败，这在未配置MongoDB的本地环境中是正常的。');
    } else {
      console.error('同步笔记到服务器失败:', error);
    }
  }
}

// 保存笔记
export async function saveNotes(notes: Note[]): Promise<void> {
  // 保存到本地存储
  saveLocalNotes(notes);
  
  // 如果启用了同步，也保存到服务器
  if (isSyncEnabled() && typeof window !== 'undefined') {
    await syncNotesToServer(notes);
  }
}

// 获取分类
export async function getCategories(): Promise<NoteCategory[]> {
  // 如果在服务器端，返回默认分类
  if (typeof window === 'undefined') return defaultCategories;
  
  // 如果启用了同步
  if (isSyncEnabled()) {
    try {
      const accessCode = getCurrentAccessCode();
      if (!accessCode) return getLocalCategories();
      
      // 获取本地分类
      const localCategories = getLocalCategories();
      
      // 获取最后同步时间
      const localLastSyncTime = getLocalLastSyncTime();
      
      // 如果有最后同步时间，获取自那时以来的更新
      if (localLastSyncTime) {
        // 从服务器获取最近更新的分类
        const response = await fetch(`/api/categories?since=${encodeURIComponent(localLastSyncTime)}`, {
          headers: {
            'x-access-code': accessCode
          }
        });
        
        if (!response.ok) {
          throw new Error(`服务器响应错误: ${response.status}`);
        }
        
        const recentCategories: NoteCategory[] = await response.json();
        
        if (recentCategories.length > 0) {
          // 合并本地和服务器分类，以服务器为准
          const mergedCategories = mergeCategories(localCategories, recentCategories);
          
          // 去重处理
          const uniqueCategories = removeDuplicateCategories(mergedCategories);
          
          // 更新本地存储
          saveLocalCategories(uniqueCategories);
          
          // 将合并后的分类同步回服务器
          await syncCategoriesToServer(uniqueCategories);
          
          return uniqueCategories;
        }
      } else {
        // 如果没有最后同步时间，从服务器获取所有分类
        const response = await fetch('/api/categories', {
          headers: {
            'x-access-code': accessCode
          }
        });
        
        if (!response.ok) {
          throw new Error(`服务器响应错误: ${response.status}`);
        }
        
        const serverCategories: NoteCategory[] = await response.json();
        
        if (serverCategories.length > 0) {
          // 合并本地和服务器分类，以服务器为准
          const mergedCategories = mergeCategories(localCategories, serverCategories);
          
          // 去重处理
          const uniqueCategories = removeDuplicateCategories(mergedCategories);
          
          // 更新本地存储
          saveLocalCategories(uniqueCategories);
          
          // 将去重后的分类同步回服务器
          await syncCategoriesToServer(uniqueCategories);
          
          return uniqueCategories;
        }
      }
      
      // 如果没有从服务器获取到分类，同步本地分类到服务器
      const uniqueLocalCategories = removeDuplicateCategories(localCategories);
      await syncCategoriesToServer(uniqueLocalCategories);
      
      return uniqueLocalCategories;
    } catch (error) {
      console.error('从服务器获取分类失败:', error);
      const uniqueLocalCategories = removeDuplicateCategories(getLocalCategories());
      return uniqueLocalCategories;
    }
  }
  
  // 如果未启用同步，使用本地存储并确保去重
  return removeDuplicateCategories(getLocalCategories());
}

// 合并分类，处理冲突
function mergeCategories(localCategories: NoteCategory[], serverCategories: NoteCategory[]): NoteCategory[] {
  // 创建一个ID到分类的映射，方便查找
  const categoryMap = new Map<string, NoteCategory>();
  
  // 先添加所有本地分类
  localCategories.forEach(category => {
    categoryMap.set(category.id, category);
  });
  
  // 然后添加或更新服务器分类
  serverCategories.forEach(serverCategory => {
    // 服务器分类优先
    categoryMap.set(serverCategory.id, serverCategory);
  });
  
  // 转换回数组
  return Array.from(categoryMap.values());
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

// 同步分类到服务器
async function syncCategoriesToServer(categories: NoteCategory[]): Promise<void> {
  if (!isSyncEnabled() || typeof window === 'undefined') return;
  
  const accessCode = getCurrentAccessCode();
  if (!accessCode) return;
  
  try {
    console.log('尝试同步分类到服务器...');
    
    // 检查是否为开发环境
    const isDev = process.env.IS_DEV === 'true';
    
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-code': accessCode
      },
      body: JSON.stringify(categories)
    });
    
    if (!response.ok) {
      // 在开发环境中，如果没有配置MongoDB，只记录信息而不抛出错误
      if (isDev) {
        console.log(`开发环境: 服务器响应错误 ${response.status}，这可能是因为未配置MongoDB。`);
        console.log('这不会影响本地存储功能，只有多设备同步功能不可用。');
        return;
      } else {
        throw new Error(`服务器响应错误: ${response.status}`);
      }
    }
    
    const result = await response.json();
    
    // 保存同步时间
    if (result.syncTime) {
      saveLastSyncTime(result.syncTime);
    }
    
    console.log('分类同步成功');
  } catch (error) {
    // 在开发环境中，如果是连接错误，只显示简化的消息
    if (process.env.IS_DEV === 'true') {
      console.log('开发环境: 同步分类到服务器失败，这在未配置MongoDB的本地环境中是正常的。');
    } else {
      console.error('同步分类到服务器失败:', error);
    }
  }
}

// 保存分类
export async function saveCategories(categories: NoteCategory[]): Promise<void> {
  // 去重：根据分类名称去重
  const uniqueCategories = removeDuplicateCategories(categories);
  
  // 保存到本地存储
  saveLocalCategories(uniqueCategories);
  
  // 如果启用了同步，也保存到服务器
  if (isSyncEnabled() && typeof window !== 'undefined') {
    await syncCategoriesToServer(uniqueCategories);
  }
}

// 根据分类名称去重
function removeDuplicateCategories(categories: NoteCategory[]): NoteCategory[] {
  const nameMap = new Map<string, NoteCategory>();
  
  // 按照顺序处理，如果有重名的，保留最后一个
  categories.forEach(category => {
    nameMap.set(category.name.toLowerCase(), category);
  });
  
  // 确保"其他"分类总是存在
  if (!nameMap.has('其他'.toLowerCase())) {
    const otherCategory = categories.find(c => c.name === '其他') || {
      id: 'other',
      name: '其他',
      description: '未分类的笔记'
    };
    nameMap.set('其他'.toLowerCase(), otherCategory);
  }
  
  return Array.from(nameMap.values());
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
  
  // 生成唯一ID
  const newId = generateId();
  
  // 检查是否已存在相同ID的笔记（极小概率但可能发生）
  const existingNote = notes.find(note => note.id === newId);
  if (existingNote) {
    console.log('ID冲突，重新生成ID');
    return createNote(noteData); // 递归调用自身重新生成ID
  }
  
  const now = new Date().toISOString();
  const newNote: Note = {
    ...noteData,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };
  
  // 将新笔记添加到笔记列表的开头
  const updatedNotes = [newNote, ...notes];
  
  // 检查是否存在重复ID（额外检查）
  const uniqueNotes = removeDuplicateNotes(updatedNotes);
  
  await saveNotes(uniqueNotes);
  
  return newNote;
}

// 去除重复ID的笔记，保留最新的
function removeDuplicateNotes(notes: Note[]): Note[] {
  const idMap = new Map<string, Note>();
  
  // 按照顺序处理，如果有重复ID，保留最后一个（最新的）
  notes.forEach(note => {
    // 如果已存在相同ID的笔记，只有当新笔记更新时间更晚时才替换
    const existingNote = idMap.get(note.id);
    if (!existingNote || new Date(note.updatedAt) > new Date(existingNote.updatedAt)) {
      idMap.set(note.id, note);
    }
  });
  
  // 转换回数组并按更新时间排序（最新的在前）
  return Array.from(idMap.values())
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
  const noteIndex = notes.findIndex(note => note.id === id);
  
  if (noteIndex === -1) {
    return false; // 没有找到要删除的笔记
  }
  
  // 使用软删除标记笔记为已删除，而不是从数组中移除
  const updatedNotes = notes.map(note => {
    if (note.id === id) {
      return {
        ...note,
        deleted: true,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString() // 更新时间戳以触发同步
      };
    }
    return note;
  });
  
  await saveNotes(updatedNotes);
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