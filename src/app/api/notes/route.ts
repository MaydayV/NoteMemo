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

// 获取笔记
export async function GET(request: NextRequest) {
  console.log('GET /api/notes - 请求笔记数据');
  
  // 检查是否启用了同步
  if (process.env.ENABLE_SYNC !== 'true') {
    console.log('同步功能未启用');
    return NextResponse.json({ 
      error: '未启用多设备同步功能' 
    }, { status: 400 });
  }

  // 从请求头中获取访问码
  const accessCode = request.headers.get('x-access-code');
  if (!accessCode) {
    console.error('未提供访问码');
    return NextResponse.json({ 
      error: '未提供访问码' 
    }, { status: 401 });
  }

  // 验证访问码
  try {
    const isValid = await validateAccessCode(accessCode);
    if (!isValid) {
      console.error('访问码无效:', accessCode);
      return NextResponse.json({ 
        error: '访问码无效' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('验证访问码时出错:', error);
    return NextResponse.json({ 
      error: '验证访问码时出错' 
    }, { status: 500 });
  }

  try {
    console.log('获取用户ID...');
    const userId = await getUserId(accessCode);
    console.log('用户ID:', userId);
    
    // 获取最后同步时间（如果提供）
    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    
    if (since) {
      console.log(`获取自 ${since} 以来更新的笔记...`);
      // 获取自指定时间以来更新的笔记
      const recentNotes = await getRecentlyUpdatedNotes(userId, since);
      console.log(`找到 ${recentNotes.length} 条更新的笔记`);
      return NextResponse.json(recentNotes);
    } else {
      console.log('获取所有笔记...');
      // 获取所有笔记
      const notesCollection = await getNotesCollection(userId);
      if (!notesCollection) {
        console.error('无法获取笔记集合');
        return NextResponse.json([]);
      }
      
      const notes = await notesCollection.find({}).toArray();
      console.log(`找到 ${notes.length} 条笔记`);
      
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
      error: '获取笔记失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// 保存笔记
export async function POST(request: NextRequest) {
  console.log('POST /api/notes - 保存笔记数据');
  
  // 检查是否启用了同步
  if (process.env.ENABLE_SYNC !== 'true') {
    console.log('同步功能未启用');
    return NextResponse.json({ 
      error: '未启用多设备同步功能' 
    }, { status: 400 });
  }

  // 从请求头中获取访问码
  const accessCode = request.headers.get('x-access-code');
  if (!accessCode) {
    console.error('未提供访问码');
    return NextResponse.json({ 
      error: '未提供访问码' 
    }, { status: 401 });
  }

  // 验证访问码
  try {
    const isValid = await validateAccessCode(accessCode);
    if (!isValid) {
      console.error('访问码无效:', accessCode);
      return NextResponse.json({ 
        error: '访问码无效' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('验证访问码时出错:', error);
    return NextResponse.json({ 
      error: '验证访问码时出错' 
    }, { status: 500 });
  }

  try {
    console.log('获取用户ID...');
    const userId = await getUserId(accessCode);
    console.log('用户ID:', userId);
    
    const notesCollection = await getNotesCollection(userId);
    
    if (!notesCollection) {
      console.error('无法获取笔记集合');
      return NextResponse.json({ 
        error: '无法访问笔记集合' 
      }, { status: 500 });
    }
    
    // 从请求体获取笔记数据
    const notes: Note[] = await request.json();
    console.log(`接收到 ${notes.length} 条笔记进行保存`);
    
    // 对每个笔记进行upsert操作
    for (const note of notes) {
      console.log(`保存笔记: ${note.id} - ${note.title}`);
      
      // 使用MongoDB文档格式，避免直接使用_id
      const noteDoc = {
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      };
      
      // 使用note.id作为查询条件
      await notesCollection.updateOne(
        { id: note.id },
        { $set: noteDoc },
        { upsert: true }
      );
    }
    
    // 更新同步时间
    const now = new Date().toISOString();
    console.log(`更新同步时间: ${now}`);
    await updateSyncInfo(userId);
    
    return NextResponse.json({ 
      success: true, 
      syncTime: now,
      message: '笔记保存成功'
    });
  } catch (error) {
    console.error('保存笔记失败:', error);
    return NextResponse.json({ 
      error: '保存笔记失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 