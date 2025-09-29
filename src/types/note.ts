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
  description?: string;
  updatedAt?: string; // 添加更新时间用于同步
}

export interface SyncInfo {
  userId: string;
  deviceId: string;
  lastSyncTime: string;
}

export interface SyncStatus {
  enabled: boolean;
  lastSyncTime?: string;
  deviceId?: string;
  message?: string;
  error?: string;
}