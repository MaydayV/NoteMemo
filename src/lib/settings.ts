'use client';

import { AppSettings, defaultSettings } from '@/types/note';
import { v4 as uuidv4 } from 'uuid';

// 本地存储 key
const SETTINGS_STORAGE_KEY = 'note-memo-settings';

// 获取应用设置
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // 如果没有存储的设置，使用默认设置并保存
    const settings = { 
      ...defaultSettings,
      sync: {
        ...defaultSettings.sync,
        deviceId: generateDeviceId()
      }
    };
    saveSettings(settings);
    return settings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
}

// 保存应用设置
export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// 更新同步设置
export function updateSyncSettings(enabled: boolean, userId?: string): AppSettings {
  const settings = getSettings();
  
  const updatedSettings: AppSettings = {
    ...settings,
    sync: {
      ...settings.sync,
      enabled,
      userId,
      lastSynced: enabled ? new Date().toISOString() : settings.sync.lastSynced
    }
  };
  
  saveSettings(updatedSettings);
  return updatedSettings;
}

// 生成设备ID
function generateDeviceId(): string {
  return uuidv4().substring(0, 8);
}

// 获取同步状态
export function isSyncEnabled(): boolean {
  const settings = getSettings();
  return settings.sync.enabled;
}

// 获取用户ID
export function getSyncUserId(): string | undefined {
  const settings = getSettings();
  return settings.sync.userId;
}

// 获取设备ID
export function getDeviceId(): string {
  const settings = getSettings();
  return settings.sync.deviceId || generateDeviceId();
}

// 获取同步键名
export function getSyncKey(accessCode: string): string {
  const userId = getSyncUserId();
  if (!userId) {
    throw new Error('用户ID未设置');
  }
  return `notes_${accessCode}_${userId}`;
} 