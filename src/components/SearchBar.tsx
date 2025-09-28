'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "搜索笔记..." }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K 快捷键聚焦搜索框
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-xl">
      <div
        className={`
          relative flex items-center border transition-colors
          ${isFocused ? 'border-black' : 'border-gray-300'}
        `}
      >
        <div className="pl-4 pr-2">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 py-3 pr-4 focus:outline-none bg-transparent text-gray-900 placeholder-gray-500"
        />

        {value && (
          <button
            onClick={clearSearch}
            className="pr-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {!isFocused && !value && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-white px-1">
          <kbd className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">⌘K</kbd>
        </div>
      )}
    </div>
  );
}