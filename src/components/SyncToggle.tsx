'use client';

import { useState, useEffect } from 'react';
import { isSyncEnabled, updateSyncSettings, getSyncUserId } from '@/lib/settings';

export default function SyncToggle() {
  const [enabled, setEnabled] = useState(false);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    const syncEnabled = isSyncEnabled();
    setEnabled(syncEnabled);
    const currentUserId = getSyncUserId();
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, []);
  
  const handleToggle = () => {
    if (!enabled) {
      setShowForm(true);
    } else {
      handleDisableSync();
    }
  };
  
  const handleEnableSync = () => {
    if (!userId.trim()) {
      setError('请输入用户ID');
      return;
    }
    
    setIsLoading(true);
    try {
      updateSyncSettings(true, userId);
      setEnabled(true);
      setShowForm(false);
      setError('');
      // 刷新页面以加载同步数据
      window.location.reload();
    } catch (error) {
      setError('启用同步失败');
      console.error('启用同步失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisableSync = () => {
    setIsLoading(true);
    try {
      updateSyncSettings(false);
      setEnabled(false);
      setError('');
      // 刷新页面以确保使用本地数据
      window.location.reload();
    } catch (error) {
      setError('禁用同步失败');
      console.error('禁用同步失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4 mb-2 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2 text-sm">多设备同步</span>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              enabled ? 'bg-black' : 'bg-gray-200'
            }`}
            disabled={isLoading}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {enabled && (
          <div className="text-xs text-gray-500">
            用户ID: {userId}
          </div>
        )}
      </div>
      
      {showForm && (
        <div className="mt-2 flex flex-col">
          <div className="mb-1 text-xs text-gray-500">
            使用MongoDB Atlas同步数据，在不同设备上使用相同的用户ID可同步笔记。
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="输入用户ID"
              className="mr-2 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
            />
            <button
              onClick={handleEnableSync}
              disabled={isLoading}
              className="rounded-md bg-black px-3 py-1 text-sm text-white hover:bg-gray-800 focus:outline-none"
            >
              {isLoading ? '处理中...' : '确认'}
            </button>
          </div>
          {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
        </div>
      )}
      
      {enabled && (
        <div className="mt-1 text-xs text-gray-500">
          笔记数据已同步到MongoDB Atlas，可在其他设备上使用相同用户ID访问。
        </div>
      )}
    </div>
  );
} 