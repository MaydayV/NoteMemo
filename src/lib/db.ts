import { MongoClient, Db, Collection } from 'mongodb';
import { Note, NoteCategory } from '@/types/note';
import { attachDatabasePool } from '@vercel/functions';

// 数据库连接信息
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'notememo';
const NOTES_COLLECTION = 'notes';
const CATEGORIES_COLLECTION = 'categories';
const USERS_COLLECTION = 'users';
const SYNC_INFO_COLLECTION = 'sync_info';

// 缓存数据库连接
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// 检查是否启用同步功能
const isSyncEnabled = () => process.env.ENABLE_SYNC === 'true' && !!MONGODB_URI;

// 同步信息接口
export interface SyncInfo {
  userId: string;
  lastSyncTime: string;
  deviceId: string;
}

// 连接数据库
export async function connectToDatabase() {
  // 如果未启用同步或没有配置数据库连接字符串，则返回null
  if (!isSyncEnabled()) {
    console.log('同步功能未启用或未配置MongoDB URI');
    return { client: null, db: null };
  }

  // 如果已经有缓存的连接，直接返回
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // 创建新连接
    console.log('尝试连接到MongoDB...');
    
    // 打印连接字符串的部分信息（不包含敏感信息）
    if (MONGODB_URI) {
      const maskedURI = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
      console.log('MongoDB URI:', maskedURI);
    } else {
      console.error('MongoDB URI 未配置');
      return { client: null, db: null };
    }
    
    const client = new MongoClient(MONGODB_URI!);
    await client.connect();
    console.log('MongoDB连接成功');
    
    // 使用Vercel的数据库连接池管理
    try {
      console.log('尝试附加到Vercel数据库连接池...');
      attachDatabasePool(client);
      console.log('成功附加到Vercel数据库连接池');
    } catch (error) {
      // 在开发环境中可能不支持Vercel的数据库连接池
      console.warn('无法附加到Vercel数据库连接池，这在开发环境中是正常的');
      console.error('附加到Vercel数据库连接池失败:', error);
    }
    
    const db = client.db(DB_NAME);
    console.log(`成功连接到数据库: ${DB_NAME}`);
    
    // 缓存连接
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('数据库连接失败:', error);
    return { client: null, db: null };
  }
}

// 获取用户ID（基于访问码）
export async function getUserId(accessCode: string): Promise<string> {
  if (!isSyncEnabled()) return accessCode; // 如果数据库未连接，使用访问码作为用户ID
  
  const { db } = await connectToDatabase();
  if (!db) return accessCode; // 如果数据库未连接，使用访问码作为用户ID
  
  const usersCollection = db.collection(USERS_COLLECTION);
  
  // 查找或创建用户
  let user = await usersCollection.findOne({ accessCode });
  
  if (!user) {
    // 如果用户不存在，创建新用户
    const result = await usersCollection.insertOne({
      accessCode,
      createdAt: new Date()
    });
    
    return result.insertedId.toString();
  }
  
  return user._id.toString();
}

// 检查是否有多个访问码
export async function hasMultipleAccessCodes(): Promise<boolean> {
  // 检查环境变量中是否配置了多个访问码
  const accessCodesStr = process.env.ACCESS_CODES;
  if (!accessCodesStr) return false;
  
  const accessCodes = accessCodesStr.split(',').map(code => code.trim());
  return accessCodes.length > 1;
}

// 验证多个访问码中的一个
export async function validateMultipleAccessCodes(code: string): Promise<boolean> {
  const accessCodesStr = process.env.ACCESS_CODES;
  if (!accessCodesStr) return false;
  
  const accessCodes = accessCodesStr.split(',').map(code => code.trim());
  return accessCodes.includes(code);
}

// 获取当前用户的笔记集合
export async function getNotesCollection(userId: string): Promise<Collection | null> {
  if (!isSyncEnabled()) return null;
  
  const { db } = await connectToDatabase();
  if (!db) return null;
  
  return db.collection(`${NOTES_COLLECTION}_${userId}`);
}

// 获取当前用户的分类集合
export async function getCategoriesCollection(userId: string): Promise<Collection | null> {
  if (!isSyncEnabled()) return null;
  
  const { db } = await connectToDatabase();
  if (!db) return null;
  
  return db.collection(`${CATEGORIES_COLLECTION}_${userId}`);
}

// 获取当前用户的同步信息集合
export async function getSyncInfoCollection(userId: string): Promise<Collection | null> {
  if (!isSyncEnabled()) return null;
  
  const { db } = await connectToDatabase();
  if (!db) return null;
  
  return db.collection(`${SYNC_INFO_COLLECTION}_${userId}`);
}

// 生成设备ID
export function generateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  
  // 尝试从localStorage获取设备ID
  const storedDeviceId = localStorage.getItem('note-memo-device-id');
  if (storedDeviceId) return storedDeviceId;
  
  // 生成新的设备ID
  const newDeviceId = 'device_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  localStorage.setItem('note-memo-device-id', newDeviceId);
  return newDeviceId;
}

// 更新同步信息
export async function updateSyncInfo(userId: string): Promise<void> {
  if (!isSyncEnabled()) return;
  
  const syncInfoCollection = await getSyncInfoCollection(userId);
  if (!syncInfoCollection) return;
  
  const deviceId = generateDeviceId();
  const now = new Date().toISOString();
  
  // 更新或创建同步信息
  await syncInfoCollection.updateOne(
    { deviceId },
    { 
      $set: { 
        userId,
        lastSyncTime: now,
        deviceId
      }
    },
    { upsert: true }
  );
}

// 获取最后同步时间
export async function getLastSyncTime(userId: string): Promise<string | null> {
  if (!isSyncEnabled()) return null;
  
  const syncInfoCollection = await getSyncInfoCollection(userId);
  if (!syncInfoCollection) return null;
  
  const deviceId = generateDeviceId();
  
  // 查找当前设备的同步信息
  const syncInfo = await syncInfoCollection.findOne({ deviceId });
  if (!syncInfo) return null;
  
  return syncInfo.lastSyncTime;
}

// 获取所有设备的最后同步时间
export async function getAllDevicesSyncInfo(userId: string): Promise<SyncInfo[]> {
  if (!isSyncEnabled()) return [];
  
  const syncInfoCollection = await getSyncInfoCollection(userId);
  if (!syncInfoCollection) return [];
  
  // 查找所有设备的同步信息
  const syncInfos = await syncInfoCollection.find({ userId }).toArray();
  
  return syncInfos.map(info => ({
    userId: info.userId,
    lastSyncTime: info.lastSyncTime,
    deviceId: info.deviceId
  }));
}

// 获取最近更新的笔记
export async function getRecentlyUpdatedNotes(userId: string, since: string): Promise<Note[]> {
  if (!isSyncEnabled()) return [];
  
  const notesCollection = await getNotesCollection(userId);
  if (!notesCollection) return [];
  
  // 查找自指定时间以来更新的笔记
  const recentNotes = await notesCollection.find({
    updatedAt: { $gt: since }
  }).toArray();
  
  // 转换MongoDB文档为Note对象
  return recentNotes.map(note => ({
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    category: note.category,
    tags: note.tags || [],
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  }));
}

// 获取最近更新的分类
export async function getRecentlyUpdatedCategories(userId: string, since: string): Promise<NoteCategory[]> {
  if (!isSyncEnabled()) return [];
  
  const categoriesCollection = await getCategoriesCollection(userId);
  if (!categoriesCollection) return [];
  
  // 查找自指定时间以来更新的分类
  const recentCategories = await categoriesCollection.find({
    updatedAt: { $gt: since }
  }).toArray();
  
  // 转换MongoDB文档为NoteCategory对象
  return recentCategories.map(category => ({
    id: category._id.toString(),
    name: category.name,
    description: category.description
  }));
} 