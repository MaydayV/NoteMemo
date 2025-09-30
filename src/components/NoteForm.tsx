'use client';

import { useState, useEffect, useRef } from 'react';
import { Note, NoteCategory } from '@/types/note';
import MarkdownRenderer from './MarkdownRenderer';

interface NoteFormProps {
  note?: Note;
  categories: NoteCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function NoteForm({ note, categories, isOpen, onClose, onSave }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setTags(note.tags.join(', '));
    } else {
      // 默认值
      setTitle('');
      setContent('');
      setCategory(categories[0]?.name || '');
      setTags('');
    }
    setPreviewMode(false);
    setIsFullscreen(false);
  }, [note, categories]);

  // 当表单打开时，自动聚焦标题输入框
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const titleInput = document.getElementById('title') as HTMLInputElement;
        if (titleInput) titleInput.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 处理全屏模式
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // 自动调整文本区域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      onSave({
        title,
        content,
        category,
        tags: tagArray,
      });
      
      onClose();
    } catch (error) {
      console.error('保存笔记时出错:', error);
      alert('保存笔记失败，请重试');
    }
  };

  const insertMarkdownSyntax = (syntax: string, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const text = selectedText || placeholder;

    let newContent = '';
    let newCursorPos = 0;

    switch (syntax) {
      case 'bold':
        newContent = content.substring(0, start) + `**${text}**` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 4 : start + 2;
        break;
      case 'italic':
        newContent = content.substring(0, start) + `*${text}*` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 2 : start + 1;
        break;
      case 'heading1':
        newContent = content.substring(0, start) + `# ${text}` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 2 : start + 2;
        break;
      case 'heading2':
        newContent = content.substring(0, start) + `## ${text}` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 3 : start + 3;
        break;
      case 'heading3':
        newContent = content.substring(0, start) + `### ${text}` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 4 : start + 4;
        break;
      case 'link':
        newContent = content.substring(0, start) + `[${text}](url)` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 7 : start + 1;
        break;
      case 'image':
        newContent = content.substring(0, start) + `![${text}](url)` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 8 : start + 2;
        break;
      case 'code':
        newContent = content.substring(0, start) + `\`${text}\`` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 2 : start + 1;
        break;
      case 'codeblock':
        newContent = content.substring(0, start) + `\`\`\`\n${text}\n\`\`\`` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 5 : start + 4;
        break;
      case 'list':
        newContent = content.substring(0, start) + `- ${text}` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 2 : start + 2;
        break;
      case 'checkbox':
        newContent = content.substring(0, start) + `- [ ] ${text}` + content.substring(end);
        newCursorPos = selectedText ? start + text.length + 6 : start + 6;
        break;
      default:
        return;
    }

    setContent(newContent);
    
    // 设置光标位置
    setTimeout(() => {
      textarea.focus();
      if (!selectedText) {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // 切换全屏模式
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  if (!isOpen) return null;

  // 全屏模式样式
  const fullscreenClass = isFullscreen ? 
    'fixed inset-0 z-50 bg-white' : 
    'fixed inset-0 bg-black bg-opacity-35 flex items-center justify-center z-50 p-4';

  // 内容区域样式
  const contentContainerClass = isFullscreen ?
    'bg-white max-w-none w-full h-full overflow-hidden flex flex-col' :
    'bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col rounded-lg';

  return (
    <div className={fullscreenClass}>
      <div className={contentContainerClass}>
        {/* Header */}
        <div className="border-b border-gray-200 p-4 md:p-6 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-black">
            {note ? '编辑笔记' : '新建笔记'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title={isFullscreen ? "退出全屏" : "全屏编辑"}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0m-5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0 -5M15 9l5 -5m0 0l-5 0m5 0l0 5M15 15l5 5m0 0l-5 0m5 0l0 -5" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
                )}
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
            <div className="space-y-4 md:space-y-6">
              {/* 标题 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-0 focus:outline-none rounded-md"
                  required
                />
              </div>

              {/* 分类 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    分类
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-0 focus:outline-none rounded-md"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 标签 */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    标签 (用逗号分隔)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="例如: nextjs, react, typescript"
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-0 focus:outline-none rounded-md"
                  />
                </div>
              </div>

              {/* 内容 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    内容 (支持Markdown格式)
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`px-3 py-1 text-xs rounded-md ${
                        previewMode ? 'bg-gray-200' : 'bg-gray-100'
                      }`}
                    >
                      {previewMode ? '编辑' : '预览'}
                    </button>
                  </div>
                </div>

                {/* Markdown工具栏 - 响应式设计 */}
                {!previewMode && (
                  <div className="flex flex-wrap gap-1 mb-2 bg-gray-50 p-1 border border-gray-300 rounded-t-md overflow-x-auto">
                    <div className="flex flex-wrap gap-1 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('heading1', '标题')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="标题1"
                      >
                        <span className="font-bold text-sm">H1</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('heading2', '标题')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="标题2"
                      >
                        <span className="font-bold text-sm">H2</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('heading3', '标题')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="标题3"
                      >
                        <span className="font-bold text-sm">H3</span>
                      </button>
                      <span className="border-r border-gray-300 h-6"></span>
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('bold', '粗体文本')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="粗体"
                      >
                        <span className="font-bold text-sm">B</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('italic', '斜体文本')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="斜体"
                      >
                        <span className="italic text-sm">I</span>
                      </button>
                      <span className="border-r border-gray-300 h-6"></span>
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('list', '列表项')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="列表"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('checkbox', '任务')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="任务列表"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('link', '链接文本')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="链接"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('image', '图片描述')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="图片"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <span className="border-r border-gray-300 h-6"></span>
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('code', '代码')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="行内代码"
                      >
                        <span className="font-mono text-sm">`</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdownSyntax('codeblock', '代码块')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="代码块"
                      >
                        <span className="font-mono text-sm">```</span>
                      </button>
                    </div>
                  </div>
                )}

                {previewMode ? (
                  <div className="border border-gray-300 rounded-md p-4 min-h-[300px] max-h-[500px] overflow-y-auto bg-white">
                    {content ? <MarkdownRenderer content={content} /> : <p className="text-gray-400">预览内容...</p>}
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:ring-0 focus:outline-none font-mono text-sm rounded-b-md"
                    required
                    style={{ minHeight: '300px' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer - 固定在底部 */}
          <div className="border-t border-gray-200 p-4 bg-white flex justify-end mt-auto">
            {/* 移动端显示预览切换按钮 */}
            {isMobile && (
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 border ${
                  previewMode 
                    ? 'border-gray-300 text-gray-700' 
                    : 'border-gray-300 bg-gray-100 text-gray-700'
                } mr-auto hover:bg-gray-50 rounded-md`}
              >
                {previewMode ? '编辑' : '预览'}
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 mr-2 hover:bg-gray-50 rounded-md"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 