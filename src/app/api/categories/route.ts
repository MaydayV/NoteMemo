import { NextRequest, NextResponse } from 'next/server';
import { 
  connectToDatabase, 
  getUserId, 
  getCategoriesCollection,
  updateSyncInfo,
  getRecentlyUpdatedCategories
} from '@/lib/db';
import { validateAccessCode } from '@/lib/auth';
import { NoteCategory } from '@/types/note';

// 获取分类
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
      // 获取自指定时间以来更新的分类
      const recentCategories = await getRecentlyUpdatedCategories(userId, since);
      return NextResponse.json(recentCategories);
    } else {
      // 获取所有分类
      const categoriesCollection = await getCategoriesCollection(userId);
      if (!categoriesCollection) {
        return NextResponse.json([]);
      }
      
      const categories = await categoriesCollection.find({}).toArray();
      
      // 转换MongoDB文档为NoteCategory对象
      const formattedCategories = categories.map(category => ({
        id: category._id.toString(),
        name: category.name,
        description: category.description
      }));
      
      return NextResponse.json(formattedCategories);
    }
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ 
      error: '获取分类失败' 
    }, { status: 500 });
  }
}

// 保存分类
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
    const categoriesCollection = await getCategoriesCollection(userId);
    
    if (!categoriesCollection) {
      return NextResponse.json({ 
        error: '无法访问分类集合' 
      }, { status: 500 });
    }
    
    // 从请求体获取分类数据
    const categories: NoteCategory[] = await request.json();
    
    // 对每个分类进行upsert操作
    for (const category of categories) {
      // 添加更新时间
      const updatedAt = new Date().toISOString();
      
      await categoriesCollection.updateOne(
        { _id: category.id },
        {
          $set: {
            name: category.name,
            description: category.description,
            updatedAt
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
      message: '分类保存成功'
    });
  } catch (error) {
    console.error('保存分类失败:', error);
    return NextResponse.json({ 
      error: '保存分类失败' 
    }, { status: 500 });
  }
} 