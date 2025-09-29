// PWA注册脚本
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // 注册成功
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // 检查是否有新版本的Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        // 监听Service Worker状态变化
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 有新版本可用，提示用户刷新
            if (confirm('有新版本可用，是否立即刷新使用？')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
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
  });
} 