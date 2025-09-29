'use client';

import { useState, useEffect } from 'react';
import { SyncStatus as SyncStatusType } from '@/types/note';
import { getCurrentAccessCode } from '@/lib/auth';
import { generateDeviceId } from '@/lib/db';

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDev, setIsDev] = useState<boolean>(false);

  useEffect(() => {
    // 检查是否为开发环境
    setIsDev(process.env.IS_DEV === 'true');
  }, []);

  // 检查同步状态
  const checkSyncStatus = async () => {
    if (typeof window === 'undefined') return;
    
    const accessCode = getCurrentAccessCode();
    if (!accessCode) {
      setError('未获取到访问码，无法检查同步状态');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('检查同步状态...');
      const response = await fetch('/api/sync', {
        headers: {
          'x-access-code': accessCode
        }
      });
      
      if (!response.ok) {
        // 在开发环境中不显示错误
        if (isDev) {
          console.log(`开发环境: 同步状态检查返回 ${response.status}，这可能是因为未配置MongoDB。`);
          setSyncStatus({
            enabled: true,
            message: '开发环境：模拟同步状态'
          });
          setLastChecked(new Date().toLocaleTimeString());
          setIsLoading(false);
          return;
        }
        throw new Error(`服务器响应错误: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('同步状态:', data);
      
      setSyncStatus(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('检查同步状态失败:', error);
      
      // 在开发环境中不显示错误
      if (isDev) {
        console.log('开发环境: 同步状态检查失败，这在未配置MongoDB的本地环境中是正常的。');
        setSyncStatus({
          enabled: true,
          message: '开发环境：模拟同步状态'
        });
      } else {
        setError(error instanceof Error ? error.message : '检查同步状态失败');
        setSyncStatus({
          enabled: false,
          error: '检查同步状态失败'
        });
      }
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
  if (!syncStatus.enabled && !isDev) return null;

  return (
    <div className="text-xs text-gray-500 flex items-center space-x-1">
      <span className="inline-flex items-center">
        <span className={`w-2 h-2 rounded-full mr-1 ${isLoading ? 'bg-yellow-500 animate-pulse' : error && !isDev ? 'bg-red-500' : 'bg-green-500'}`}></span>
        {isLoading ? '同步中...' : error && !isDev ? '同步错误' : isDev ? '开发模式' : '已同步'}
      </span>
      {lastChecked && !error && (
        <span className="text-gray-400">({lastChecked})</span>
      )}
      {error && !isDev && (
        <span className="text-red-400 text-xs" title={error}>错误</span>
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