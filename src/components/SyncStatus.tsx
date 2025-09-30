'use client';

import { useState, useEffect } from 'react';
import { getCurrentAccessCode } from '@/lib/auth';
import { getNotes, getCategories } from '@/lib/notes';

interface SyncStatusProps {
  className?: string;
}

interface SyncDevice {
  deviceId: string;
  lastSyncTime: string;
}

export default function SyncStatus({ className = '' }: SyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<'checking' | 'enabled' | 'disabled' | 'error' | 'syncing'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [syncDevices, setSyncDevices] = useState<SyncDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // 获取当前设备ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const deviceId = localStorage.getItem('note-memo-device-id');
      if (deviceId) {
        setCurrentDeviceId(deviceId);
      }
    }
  }, []);

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
          setLastSyncTime(formatDateTime(new Date(storedSyncTime)));
        }
        
        // 获取同步设备信息
        if (data.syncInfo && Array.isArray(data.syncInfo)) {
          const devices = data.syncInfo.map((device: any) => ({
            deviceId: device.deviceId,
            lastSyncTime: device.lastSyncTime
          }));
          setSyncDevices(devices);
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

  // 格式化日期时间
  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 格式化设备ID
  const formatDeviceId = (deviceId: string): string => {
    if (deviceId === 'server') return '服务器';
    if (deviceId === currentDeviceId) return '当前设备';
    if (deviceId.startsWith('device_')) {
      return `设备 ${deviceId.substring(7, 12)}`;
    }
    return deviceId.substring(0, 8);
  };

  // 强制同步
  const forceSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncProgress(0);
    
    try {
      // 清除最后同步时间，强制完全同步
      localStorage.removeItem('note-memo-last-sync');
      
      // 模拟同步进度
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.floor(Math.random() * 10);
        });
      }, 300);
      
      // 重新获取笔记和分类
      await Promise.all([getNotes(), getCategories()]);
      
      // 更新同步时间
      const now = new Date();
      localStorage.setItem('note-memo-last-sync', now.toISOString());
      setLastSyncTime(formatDateTime(now));
      
      // 完成同步
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      // 短暂延迟后重置状态
      setTimeout(() => {
        setSyncStatus('enabled');
        setSyncProgress(0);
        setIsSyncing(false);
        // 重新获取同步状态
        checkSyncStatus();
      }, 500);
    } catch (error) {
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '强制同步失败');
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
    
    // 每5分钟自动检查一次同步状态
    const intervalId = setInterval(checkSyncStatus, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 切换显示详细信息
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

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
      <div className={`flex flex-col text-xs ${className}`}>
        <div className="flex items-center text-red-500">
          <svg className="h-3 w-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">同步错误: {errorMessage || '未知错误'}</span>
          <button 
            onClick={forceSync} 
            disabled={isSyncing}
            className="ml-2 text-blue-500 hover:text-blue-700 flex-shrink-0"
            title="尝试重新同步"
          >
            {isSyncing ? (
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (syncStatus === 'disabled') {
    return (
      <div className={`flex items-center text-xs text-gray-500 ${className}`}>
        <svg className="h-3 w-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>多设备同步未启用</span>
      </div>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <div className={`flex flex-col text-xs ${className}`}>
        <div className="flex items-center text-blue-500">
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>正在同步数据...</span>
          <span className="ml-1 text-gray-500">{syncProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${syncProgress}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col text-xs ${className}`}>
      <div className="flex items-center">
        <div className="flex items-center text-green-600">
          <svg className="h-3 w-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>同步已启用</span>
          {lastSyncTime && (
            <span className="ml-1 text-gray-500">
              (最后同步: {lastSyncTime})
            </span>
          )}
        </div>
        
        <div className="flex ml-auto space-x-2">
          <button 
            onClick={toggleDetails} 
            className="text-gray-500 hover:text-gray-700"
            title={showDetails ? "隐藏详情" : "显示详情"}
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showDetails ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
          
          <button 
            onClick={forceSync} 
            disabled={isSyncing}
            className="text-blue-500 hover:text-blue-700 flex-shrink-0"
            title="强制重新同步所有数据"
          >
            {isSyncing ? (
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* 详细信息展开面板 */}
      {showDetails && syncDevices.length > 0 && (
        <div className="mt-2 bg-gray-50 p-2 rounded-md border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-1">同步设备</h4>
          <ul className="space-y-1">
            {syncDevices.map((device) => (
              <li key={device.deviceId} className="flex justify-between">
                <span className={device.deviceId === currentDeviceId ? "font-medium" : ""}>
                  {formatDeviceId(device.deviceId)}
                  {device.deviceId === currentDeviceId && " (当前)"}
                </span>
                <span className="text-gray-500">
                  {new Date(device.lastSyncTime).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 