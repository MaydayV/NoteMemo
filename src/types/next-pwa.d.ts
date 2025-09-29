declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: any[];
    buildExcludes?: Array<string | RegExp> | ((path: string) => boolean);
    dynamicStartUrl?: boolean;
    fallbacks?: Record<string, string>;
  }
  
  function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
  export = withPWA;
} 