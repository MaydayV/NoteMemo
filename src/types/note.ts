export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteCategory {
  id: string;
  name: string;
  description: string;
}

// 同步设置类型
export interface SyncSettings {
  enabled: boolean;
  userId?: string;
  deviceId?: string;
  lastSynced?: string;
}

// 应用设置类型
export interface AppSettings {
  sync: SyncSettings;
}

// 默认设置
export const defaultSettings: AppSettings = {
  sync: {
    enabled: false,
    deviceId: '',
    lastSynced: ''
  }
};