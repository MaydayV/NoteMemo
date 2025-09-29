'use client';

import { useState, useEffect } from 'react';
import { SyncStatus as SyncStatusType } from '@/types/note';
import { getCurrentAccessCode } from '@/lib/auth';
import { generateDeviceId } from '@/lib/db';

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  // 检查同步状态
  const checkSyncStatus = async () => {
    if (typeof window === 'undefined') return;
    
    const accessCode = getCurrentAccessCode();
    if (!accessCode) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/sync', {
        headers: {
          'x-access-code': accessCode
        }
      });
      
      const data = await response.json();
      setSyncStatus(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('检查同步状态失败:', error);
      setSyncStatus({
        enabled: false,
        error: '检查同步状态失败'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时检查同步状态
  useEffect(() => {
    if (process.env.ENABLE_SYNC === 'true') {
      checkSyncStatus();
    } else {
      setSyncStatus({
        enabled: false,
        message: '未启用多设备同步功能'
      });
    }
  }, []);

  // 如果未启用同步，不显示组件
  if (!syncStatus) return null;
  if (!syncStatus.enabled) return null;

  return (
    <div className="text-xs text-gray-500 flex items-center space-x-1">
      <span className="inline-flex items-center">
        <span className={`w-2 h-2 rounded-full mr-1 ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
        {isLoading ? '同步中...' : '已同步'}
      </span>
      {lastChecked && (
        <span className="text-gray-400">({lastChecked})</span>
      )}
      <button 
        onClick={checkSyncStatus} 
        disabled={isLoading}
        className="ml-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        title="刷新同步状态"
      >
        ↻
      </button>
    </div>
  );
} 