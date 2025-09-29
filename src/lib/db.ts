import { Note, NoteCategory } from '@/types/note';
import clientPromise from './mongodb';
import { Collection, Db } from 'mongodb';

// 数据库和集合名称
const DB_NAME = 'notememo';
const NOTES_COLLECTION = 'notes';
const CATEGORIES_COLLECTION = 'categories';

// 数据库同步开关
export const isDbSyncEnabled = (): boolean => {
  return process.env.ENABLE_DB_SYNC === 'true' && !!process.env.MONGODB_URI;
};

// 获取数据库实例
async function getDatabase(): Promise<Db | null> {
  if (!isDbSyncEnabled()) return null;
  
  try {
    const client = await clientPromise;
    return client.db(DB_NAME);
  } catch (error) {
    console.error('无法连接到MongoDB:', error);
    return null;
  }
}

// 获取笔记集合
async function getNotesCollection(): Promise<Collection<Note> | null> {
  const db = await getDatabase();
  if (!db) return null;
  return db.collection<Note>(NOTES_COLLECTION);
}

// 获取分类集合
async function getCategoriesCollection(): Promise<Collection<NoteCategory> | null> {
  const db = await getDatabase();
  if (!db) return null;
  return db.collection<NoteCategory>(CATEGORIES_COLLECTION);
}

// 从数据库获取所有笔记
export async function getNotesFromDb(): Promise<Note[] | null> {
  const collection = await getNotesCollection();
  if (!collection) return null;
  
  try {
    return await collection.find().sort({ updatedAt: -1 }).toArray();
  } catch (error) {
    console.error('获取笔记失败:', error);
    return null;
  }
}

// 保存笔记到数据库
export async function saveNotesToDb(notes: Note[]): Promise<boolean> {
  const collection = await getNotesCollection();
  if (!collection) return false;
  
  try {
    // 先清空集合
    await collection.deleteMany({});
    
    // 如果没有笔记，直接返回成功
    if (notes.length === 0) return true;
    
    // 插入所有笔记
    await collection.insertMany(notes);
    return true;
  } catch (error) {
    console.error('保存笔记失败:', error);
    return false;
  }
}

// 从数据库获取所有分类
export async function getCategoriesFromDb(): Promise<NoteCategory[] | null> {
  const collection = await getCategoriesCollection();
  if (!collection) return null;
  
  try {
    return await collection.find().toArray();
  } catch (error) {
    console.error('获取分类失败:', error);
    return null;
  }
}

// 保存分类到数据库
export async function saveCategoriesToDb(categories: NoteCategory[]): Promise<boolean> {
  const collection = await getCategoriesCollection();
  if (!collection) return false;
  
  try {
    // 先清空集合
    await collection.deleteMany({});
    
    // 如果没有分类，直接返回成功
    if (categories.length === 0) return true;
    
    // 插入所有分类
    await collection.insertMany(categories);
    return true;
  } catch (error) {
    console.error('保存分类失败:', error);
    return false;
  }
}

// 创建一个新笔记到数据库
export async function createNoteInDb(note: Note): Promise<boolean> {
  const collection = await getNotesCollection();
  if (!collection) return false;
  
  try {
    await collection.insertOne(note);
    return true;
  } catch (error) {
    console.error('创建笔记失败:', error);
    return false;
  }
}

// 更新数据库中的笔记
export async function updateNoteInDb(id: string, noteData: Partial<Note>): Promise<boolean> {
  const collection = await getNotesCollection();
  if (!collection) return false;
  
  try {
    const result = await collection.updateOne(
      { id }, // 查询条件
      { $set: noteData } // 更新操作
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('更新笔记失败:', error);
    return false;
  }
}

// 从数据库中删除笔记
export async function deleteNoteFromDb(id: string): Promise<boolean> {
  const collection = await getNotesCollection();
  if (!collection) return false;
  
  try {
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('删除笔记失败:', error);
    return false;
  }
}

// 创建一个新分类到数据库
export async function createCategoryInDb(category: NoteCategory): Promise<boolean> {
  const collection = await getCategoriesCollection();
  if (!collection) return false;
  
  try {
    await collection.insertOne(category);
    return true;
  } catch (error) {
    console.error('创建分类失败:', error);
    return false;
  }
}

// 更新数据库中的分类
export async function updateCategoryInDb(id: string, categoryData: Partial<NoteCategory>): Promise<boolean> {
  const collection = await getCategoriesCollection();
  if (!collection) return false;
  
  try {
    const result = await collection.updateOne(
      { id }, // 查询条件
      { $set: categoryData } // 更新操作
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('更新分类失败:', error);
    return false;
  }
}

// 从数据库中删除分类
export async function deleteCategoryFromDb(id: string): Promise<boolean> {
  const collection = await getCategoriesCollection();
  if (!collection) return false;
  
  try {
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('删除分类失败:', error);
    return false;
  }
} 