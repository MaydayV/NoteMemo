// Service Worker for NoteMemo PWA
const CACHE_NAME = 'notememo-cache-v2'; // 更新缓存版本
const STATIC_CACHE_NAME = 'notememo-static-v2';
const DYNAMIC_CACHE_NAME = 'notememo-dynamic-v2';
const DATA_CACHE_NAME = 'notememo-data-v2';

// 需要缓存的静态资源
const staticAssets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/Listpage.png',
  '/Loginpage.png',
  '/NoteDetails.png',
  '/next.svg',
  '/vercel.svg',
  '/file.svg',
  '/globe.svg',
  '/window.svg',
];

// 安装Service Worker并缓存核心资源
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching static assets');
        return cache.addAll(staticAssets);
      })
      .then(() => {
        console.log('[ServiceWorker] Installed successfully');
        return self.skipWaiting(); // 立即激活新的Service Worker
      })
  );
});

// 当新的Service Worker激活时，清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME && 
            cacheName !== DYNAMIC_CACHE_NAME && 
            cacheName !== DATA_CACHE_NAME
          ) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim(); // 控制所有打开的客户端
    })
  );
});

// 处理fetch请求 - 使用策略模式
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API请求使用"网络优先"策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // 静态资源使用"缓存优先"策略
  if (isStaticAsset(event.request)) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // 其他请求使用"Stale-While-Revalidate"策略
  event.respondWith(staleWhileRevalidateStrategy(event.request));
});

// 网络优先策略 - 适用于API请求
async function networkFirstStrategy(request) {
  try {
    console.log('[ServiceWorker] Network-first fetch:', request.url);
    const networkResponse = await fetch(request);
    
    // 只缓存成功的GET请求
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[ServiceWorker] Cached API response');
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network request failed, falling back to cache');
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response(JSON.stringify({ error: 'Network error, no cached data available' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

// 缓存优先策略 - 适用于静态资源
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('[ServiceWorker] Found in cache:', request.url);
    // 在后台更新缓存
    updateCache(request);
    return cachedResponse;
  }
  
  // 如果缓存中没有，从网络获取
  console.log('[ServiceWorker] Not found in cache, fetching:', request.url);
  return fetchAndCache(request, STATIC_CACHE_NAME);
}

// Stale-While-Revalidate策略 - 适用于大多数请求
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  // 无论是否有缓存，都发起网络请求更新缓存
  const fetchPromise = fetchAndCache(request, DYNAMIC_CACHE_NAME);
  
  // 如果有缓存就返回缓存，否则等待网络请求
  return cachedResponse || fetchPromise;
}

// 辅助函数：从网络获取并缓存
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // 只缓存成功的响应
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Fetch failed:', error);
    // 对于非API请求，如果网络请求失败且没有缓存，返回离线页面
    if (!request.url.includes('/api/')) {
      return caches.match('/') || new Response('Network error', { status: 503 });
    }
    throw error;
  }
}

// 在后台更新缓存，不影响响应速度
function updateCache(request) {
  fetch(request).then(response => {
    if (response.ok && request.method === 'GET') {
      caches.open(STATIC_CACHE_NAME).then(cache => {
        cache.put(request, response);
      });
    }
  }).catch(err => {
    console.log('[ServiceWorker] Background cache update failed:', err);
  });
}

// 检查是否为静态资源
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  // 检查是否在预缓存列表中
  if (staticAssets.includes(url.pathname)) {
    return true;
  }
  
  // 检查文件扩展名
  const extension = url.pathname.split('.').pop();
  return ['js', 'css', 'png', 'jpg', 'jpeg', 'svg', 'gif', 'ico', 'woff', 'woff2', 'ttf', 'eot'].includes(extension);
}

// 添加离线检测和通知
self.addEventListener('online', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'ONLINE_STATUS',
        online: true
      });
    });
  });
});

self.addEventListener('offline', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'ONLINE_STATUS',
        online: false
      });
    });
  });
});

// 接收消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 