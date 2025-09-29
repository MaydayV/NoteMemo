'use client';

import { useState, useEffect } from 'react';
import { isSyncEnabled, updateSyncSettings } from '@/lib/settings';

export default function SyncToggle() {
  const [enabled, setEnabled] = useState(false);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // 初始化时检查同步状态
    const syncEnabled = isSyncEnabled();
    setEnabled(syncEnabled);
  }, []);

  const handleToggle = () => {
    if (!enabled) {
      // 如果要启用同步，显示表单
      setShowForm(true);
    } else {
      // 如果要禁用同步，直接更新设置
      handleDisableSync();
    }
  };

  const handleEnableSync = () => {
    if (!userId.trim()) {
      setError('请输入用户ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      updateSyncSettings(true, userId);
      setEnabled(true);
      setShowForm(false);
      // 刷新页面以加载云端数据
      window.location.reload();
    } catch (err) {
      setError('启用同步失败，请重试');
      console.error('Failed to enable sync:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableSync = () => {
    setIsLoading(true);
    setError(null);

    try {
      updateSyncSettings(false);
      setEnabled(false);
      // 刷新页面以确保使用本地数据
      window.location.reload();
    } catch (err) {
      setError('禁用同步失败，请重试');
      console.error('Failed to disable sync:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">多设备同步</h3>
          <p className="text-sm text-gray-500">
            {enabled 
              ? '已启用同步，笔记将在多设备间共享' 
              : '启用后可在多设备间同步笔记'}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={handleToggle}
            disabled={isLoading}
          />
          <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer ${
            enabled ? 'peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600' : ''
          } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
        </label>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm mb-2">请输入用户ID（用于区分不同用户的数据）：</p>
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="用户ID（如：user123）"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
              onClick={handleEnableSync}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : '确认'}
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={() => setShowForm(false)}
              disabled={isLoading}
            >
              取消
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            注意：请记住您的用户ID，在其他设备上使用相同ID可同步笔记
          </p>
        </div>
      )}
    </div>
  );
} 