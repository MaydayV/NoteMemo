import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { NoteCategory } from '@/types/note';

// 获取分类
export async function GET(request: NextRequest) {
  try {
    // 从URL参数获取用户ID
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID参数' }, { status: 400 });
    }
    
    // 从MongoDB获取分类
    const collection = await getCollection('categories');
    const documents = await collection.find({ userId }).toArray();
    
    // 移除MongoDB自动添加的_id字段
    const categories = documents.map(doc => {
      const { _id, ...categoryData } = doc;
      return categoryData;
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}

// 保存分类
export async function POST(request: NextRequest) {
  try {
    const { categories, userId } = await request.json();
    
    if (!userId || !Array.isArray(categories)) {
      return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
    }
    
    const collection = await getCollection('categories');
    
    // 删除用户现有的分类
    await collection.deleteMany({ userId });
    
    // 添加用户ID到每个分类
    const categoriesWithUserId = categories.map(category => ({ ...category, userId }));
    
    // 批量插入分类
    if (categoriesWithUserId.length > 0) {
      await collection.insertMany(categoriesWithUserId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存分类失败:', error);
    return NextResponse.json({ error: '保存分类失败' }, { status: 500 });
  }
} 