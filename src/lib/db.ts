import { MongoClient, Db, Collection } from 'mongodb';
import { Note, NoteCategory } from '@/types/note';
import { attachDatabasePool } from '@vercel/functions';

// 数据库连接信息
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'notememo';
const NOTES_COLLECTION = 'notes';
const CATEGORIES_COLLECTION = 'categories';
const USERS_COLLECTION = 'users';

// 缓存数据库连接
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// 连接数据库
export async function connectToDatabase() {
  // 如果未启用同步或没有配置数据库连接字符串，则返回null
  if (process.env.ENABLE_SYNC !== 'true' || !MONGODB_URI) {
    return { client: null, db: null };
  }

  // 如果已经有缓存的连接，直接返回
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // 创建新连接
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // 使用Vercel的数据库连接池管理
    attachDatabasePool(client);
    
    const db = client.db(DB_NAME);
    
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
  const { db } = await connectToDatabase();
  if (!db) return null;
  
  return db.collection(`${NOTES_COLLECTION}_${userId}`);
}

// 获取当前用户的分类集合
export async function getCategoriesCollection(userId: string): Promise<Collection | null> {
  const { db } = await connectToDatabase();
  if (!db) return null;
  
  return db.collection(`${CATEGORIES_COLLECTION}_${userId}`);
} 