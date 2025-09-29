import { NextRequest, NextResponse } from 'next/server';
import { 
  connectToDatabase, 
  getUserId, 
  getNotesCollection,
  updateSyncInfo,
  getLastSyncTime,
  getRecentlyUpdatedNotes
} from '@/lib/db';
import { validateAccessCode } from '@/lib/auth';
import { Note } from '@/types/note';
import { ObjectId } from 'mongodb';

// 获取笔记
export async function GET(request: NextRequest) {
  // 检查是否启用了同步
  if (process.env.ENABLE_SYNC !== 'true') {
    return NextResponse.json({ 
      error: '未启用多设备同步功能' 
    }, { status: 400 });
  }

  // 从请求头中获取访问码
  const accessCode = request.headers.get('x-access-code');
  if (!accessCode) {
    return NextResponse.json({ 
      error: '未提供访问码' 
    }, { status: 401 });
  }

  // 验证访问码
  const isValid = await validateAccessCode(accessCode);
  if (!isValid) {
    return NextResponse.json({ 
      error: '访问码无效' 
    }, { status: 401 });
  }

  try {
    const userId = await getUserId(accessCode);
    
    // 获取最后同步时间（如果提供）
    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    
    if (since) {
      // 获取自指定时间以来更新的笔记
      const recentNotes = await getRecentlyUpdatedNotes(userId, since);
      return NextResponse.json(recentNotes);
    } else {
      // 获取所有笔记
      const notesCollection = await getNotesCollection(userId);
      if (!notesCollection) {
        return NextResponse.json([]);
      }
      
      const notes = await notesCollection.find({}).toArray();
      
      // 转换MongoDB文档为Note对象
      const formattedNotes = notes.map(note => ({
        id: note._id.toString(),
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags || [],
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }));
      
      return NextResponse.json(formattedNotes);
    }
  } catch (error) {
    console.error('获取笔记失败:', error);
    return NextResponse.json({ 
      error: '获取笔记失败' 
    }, { status: 500 });
  }
}

// 保存笔记
export async function POST(request: NextRequest) {
  // 检查是否启用了同步
  if (process.env.ENABLE_SYNC !== 'true') {
    return NextResponse.json({ 
      error: '未启用多设备同步功能' 
    }, { status: 400 });
  }

  // 从请求头中获取访问码
  const accessCode = request.headers.get('x-access-code');
  if (!accessCode) {
    return NextResponse.json({ 
      error: '未提供访问码' 
    }, { status: 401 });
  }

  // 验证访问码
  const isValid = await validateAccessCode(accessCode);
  if (!isValid) {
    return NextResponse.json({ 
      error: '访问码无效' 
    }, { status: 401 });
  }

  try {
    const userId = await getUserId(accessCode);
    const notesCollection = await getNotesCollection(userId);
    
    if (!notesCollection) {
      return NextResponse.json({ 
        error: '无法访问笔记集合' 
      }, { status: 500 });
    }
    
    // 从请求体获取笔记数据
    const notes: Note[] = await request.json();
    
    // 对每个笔记进行upsert操作
    for (const note of notes) {
      // 使用字符串ID作为_id
      await notesCollection.updateOne(
        { _id: note.id },
        {
          $set: {
            title: note.title,
            content: note.content,
            category: note.category,
            tags: note.tags,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
          }
        },
        { upsert: true }
      );
    }
    
    // 更新同步时间
    const now = new Date().toISOString();
    await updateSyncInfo(userId);
    
    return NextResponse.json({ 
      success: true, 
      syncTime: now,
      message: '笔记保存成功'
    });
  } catch (error) {
    console.error('保存笔记失败:', error);
    return NextResponse.json({ 
      error: '保存笔记失败' 
    }, { status: 500 });
  }
} 