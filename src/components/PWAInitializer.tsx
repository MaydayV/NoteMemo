'use client';

import { useEffect, useState } from 'react';

export default function PWAInitializer() {
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    // 初始化时检查网络状态
    setIsOffline(!navigator.onLine);

    // 监听在线/离线状态
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      // 3秒后隐藏提示
      setTimeout(() => setShowOnlineToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineToast(true);
      // 5秒后隐藏提示
      setTimeout(() => setShowOfflineToast(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA注册脚本
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        // 注册成功
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // 检查是否有新版本的Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          // 监听Service Worker状态变化
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 有新版本可用，提示用户刷新
                if (confirm('有新版本可用，是否立即刷新使用？')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
        
      }).catch(function(err) {
        // 注册失败
        console.log('ServiceWorker registration failed: ', err);
      });
      
      // 处理控制权变更
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      // 监听来自Service Worker的消息
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'ONLINE_STATUS') {
          if (event.data.online) {
            setIsOffline(false);
            setShowOnlineToast(true);
            setTimeout(() => setShowOnlineToast(false), 3000);
          } else {
            setIsOffline(true);
            setShowOfflineToast(true);
            setTimeout(() => setShowOfflineToast(false), 5000);
          }
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* 离线状态指示器 - 始终显示在页面顶部 */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white py-1 px-4 text-center z-50">
          <div className="flex items-center justify-center">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>您当前处于离线状态，部分功能可能不可用</span>
          </div>
        </div>
      )}

      {/* 离线状态提示 Toast */}
      {showOfflineToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>网络连接已断开，切换到离线模式</span>
        </div>
      )}

      {/* 在线状态提示 Toast */}
      {showOnlineToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>网络已连接，数据将自动同步</span>
        </div>
      )}
    </>
  );
} 