import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Note } from '@/types/note';

// 获取笔记
export async function GET(request: NextRequest) {
  try {
    // 从URL参数获取用户ID
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID参数' }, { status: 400 });
    }
    
    // 从MongoDB获取笔记
    const collection = await getCollection('notes');
    const documents = await collection.find({ userId }).toArray();
    
    // 移除MongoDB自动添加的_id字段
    const notes = documents.map(doc => {
      const { _id, ...noteData } = doc;
      return noteData;
    });
    
    return NextResponse.json(notes);
  } catch (error) {
    console.error('获取笔记失败:', error);
    return NextResponse.json({ error: '获取笔记失败' }, { status: 500 });
  }
}

// 保存笔记
export async function POST(request: NextRequest) {
  try {
    const { notes, userId } = await request.json();
    
    if (!userId || !Array.isArray(notes)) {
      return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
    }
    
    const collection = await getCollection('notes');
    
    // 删除用户现有的笔记
    await collection.deleteMany({ userId });
    
    // 添加用户ID到每条笔记
    const notesWithUserId = notes.map(note => ({ ...note, userId }));
    
    // 批量插入笔记
    if (notesWithUserId.length > 0) {
      await collection.insertMany(notesWithUserId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存笔记失败:', error);
    return NextResponse.json({ error: '保存笔记失败' }, { status: 500 });
  }
} 