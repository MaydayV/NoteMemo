declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface RuntimeCachingRule {
    urlPattern: RegExp | string;
    handler: string;
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      cacheableResponse?: {
        statuses?: number[];
        headers?: Record<string, string>;
      };
      networkTimeoutSeconds?: number;
      backgroundSync?: {
        name: string;
        options?: {
          maxRetentionTime?: number;
        };
      };
      broadcastUpdate?: {
        channelName: string;
        options?: {
          headersToCheck?: string[];
        };
      };
      plugins?: unknown[];
      fetchOptions?: Record<string, unknown>;
      matchOptions?: Record<string, unknown>;
    };
  }

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: RuntimeCachingRule[];
    buildExcludes?: Array<string | RegExp> | ((path: string) => boolean);
    dynamicStartUrl?: boolean;
    fallbacks?: Record<string, string>;
  }
  
  function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
  export = withPWA;
} 