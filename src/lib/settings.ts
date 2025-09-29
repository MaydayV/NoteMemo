'use client';

import { AppSettings, defaultSettings, SyncSettings } from '@/types/note';
import { v4 as uuidv4 } from 'uuid';

// 本地存储键
const SETTINGS_STORAGE_KEY = 'note-memo-settings';

// 获取应用设置
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // 如果没有存储的设置，使用默认设置并保存
    saveSettings(defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error loading settings from local storage:', error);
    return defaultSettings;
  }
}

// 保存应用设置
export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to local storage:', error);
  }
}

// 生成设备ID
export function generateDeviceId(): string {
  return uuidv4();
}

// 更新同步设置
export function updateSyncSettings(enabled: boolean, userId?: string): void {
  const settings = getSettings();
  
  if (enabled && userId) {
    // 启用同步
    settings.sync = {
      ...settings.sync,
      enabled: true,
      userId,
      deviceId: settings.sync.deviceId || generateDeviceId(),
      lastSynced: new Date().toISOString()
    };
  } else {
    // 禁用同步
    settings.sync = {
      ...settings.sync,
      enabled: false,
      lastSynced: new Date().toISOString()
    };
  }
  
  saveSettings(settings);
}

// 检查是否启用同步
export function isSyncEnabled(): boolean {
  const settings = getSettings();
  return settings.sync.enabled && !!settings.sync.userId;
}

// 获取同步用户ID
export function getSyncUserId(): string | undefined {
  const settings = getSettings();
  return settings.sync.userId;
}

// 获取设备ID
export function getDeviceId(): string {
  const settings = getSettings();
  if (!settings.sync.deviceId) {
    const deviceId = generateDeviceId();
    updateSyncSettings(settings.sync.enabled, settings.sync.userId);
    return deviceId;
  }
  return settings.sync.deviceId;
} 