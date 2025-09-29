'use client';

import { useState, useEffect } from 'react';
import { getCurrentAccessCode } from '@/lib/auth';
import { getNotes, getCategories } from '@/lib/notes';

interface SyncStatusProps {
  className?: string;
}

export default function SyncStatus({ className = '' }: SyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<'checking' | 'enabled' | 'disabled' | 'error' | 'syncing'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // 检查同步状态
  const checkSyncStatus = async () => {
    try {
      const accessCode = getCurrentAccessCode();
      if (!accessCode) {
        setSyncStatus('disabled');
        return;
      }

      const response = await fetch('/api/sync', {
        headers: {
          'x-access-code': accessCode
        }
      });

      if (!response.ok) {
        setSyncStatus('error');
        setErrorMessage(`服务器响应错误: ${response.status}`);
        return;
      }

      const data = await response.json();
      
      if (data.enabled) {
        setSyncStatus('enabled');
        // 获取本地存储的最后同步时间
        const storedSyncTime = localStorage.getItem('note-memo-last-sync');
        if (storedSyncTime) {
          setLastSyncTime(new Date(storedSyncTime).toLocaleString());
        }
      } else {
        setSyncStatus('disabled');
        setErrorMessage(data.message || '同步功能未启用');
      }
    } catch (error) {
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '检查同步状态时出错');
    }
  };

  // 强制同步
  const forceSync = async () => {
    if (syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    try {
      // 清除最后同步时间，强制完全同步
      localStorage.removeItem('note-memo-last-sync');
      
      // 重新获取笔记和分类
      await Promise.all([getNotes(), getCategories()]);
      
      // 更新同步时间
      const now = new Date();
      localStorage.setItem('note-memo-last-sync', now.toISOString());
      setLastSyncTime(now.toLocaleString());
      
      setSyncStatus('enabled');
    } catch (error) {
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '强制同步失败');
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, []);

  if (syncStatus === 'checking') {
    return (
      <div className={`flex items-center text-xs text-gray-500 ${className}`}>
        <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        检查同步状态...
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div className={`flex items-center text-xs text-red-500 ${className}`}>
        <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {errorMessage || '同步错误'}
        <button 
          onClick={forceSync} 
          className="ml-2 text-blue-500 hover:text-blue-700"
          title="尝试重新同步"
        >
          重试
        </button>
      </div>
    );
  }

  if (syncStatus === 'disabled') {
    return (
      <div className={`flex items-center text-xs text-gray-500 ${className}`}>
        <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        同步未启用
      </div>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <div className={`flex items-center text-xs text-blue-500 ${className}`}>
        <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        正在同步...
      </div>
    );
  }

  return (
    <div className={`flex items-center text-xs text-green-600 ${className}`}>
      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      同步已启用
      {lastSyncTime && (
        <span className="ml-1 text-gray-500">
          (最后同步: {lastSyncTime})
        </span>
      )}
      <button 
        onClick={forceSync} 
        className="ml-2 text-blue-500 hover:text-blue-700"
        title="强制重新同步所有数据"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
} 