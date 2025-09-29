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
  console.log('GET /api/categories - 请求分类数据');
  
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
      console.log(`获取自 ${since} 以来更新的分类...`);
      // 获取自指定时间以来更新的分类
      const recentCategories = await getRecentlyUpdatedCategories(userId, since);
      console.log(`找到 ${recentCategories.length} 条更新的分类`);
      return NextResponse.json(recentCategories);
    } else {
      console.log('获取所有分类...');
      // 获取所有分类
      const categoriesCollection = await getCategoriesCollection(userId);
      if (!categoriesCollection) {
        console.error('无法获取分类集合');
        return NextResponse.json([]);
      }
      
      const categories = await categoriesCollection.find({}).toArray();
      console.log(`找到 ${categories.length} 条分类`);
      
      // 转换MongoDB文档为NoteCategory对象
      const formattedCategories = categories.map(category => ({
        id: category.id || category._id.toString(), // 优先使用id字段，如果不存在则使用_id
        name: category.name,
        description: category.description
      }));
      
      return NextResponse.json(formattedCategories);
    }
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ 
      error: '获取分类失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// 保存分类
export async function POST(request: NextRequest) {
  console.log('POST /api/categories - 保存分类数据');
  
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
    
    const categoriesCollection = await getCategoriesCollection(userId);
    
    if (!categoriesCollection) {
      console.error('无法获取分类集合');
      return NextResponse.json({ 
        error: '无法访问分类集合' 
      }, { status: 500 });
    }
    
    // 从请求体获取分类数据
    const categories: NoteCategory[] = await request.json();
    console.log(`接收到 ${categories.length} 条分类进行保存`);
    
    // 获取所有分类ID，用于后续清理
    const categoryIds = categories.map(cat => cat.id);
    
    // 先进行去重处理，确保没有重名分类
    const uniqueCategories = removeDuplicateCategories(categories);
    console.log(`去重后剩余 ${uniqueCategories.length} 条分类`);
    
    // 清理数据库中所有不在当前列表中的分类（删除操作）
    const deleteResult = await categoriesCollection.deleteMany({
      id: { $nin: uniqueCategories.map(cat => cat.id) }
    });
    console.log(`已删除 ${deleteResult.deletedCount} 条旧分类`);
    
    // 对每个分类进行upsert操作
    for (const category of uniqueCategories) {
      console.log(`保存分类: ${category.id} - ${category.name}`);
      // 添加更新时间
      const updatedAt = new Date().toISOString();
      
      // 使用MongoDB文档格式，避免直接使用_id
      const categoryDoc = {
        id: category.id, // 确保保存id字段
        name: category.name,
        description: category.description,
        updatedAt
      };
      
      // 使用category.id作为查询条件
      await categoriesCollection.updateOne(
        { id: category.id },
        { $set: categoryDoc },
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
      message: '分类保存成功'
    });
  } catch (error) {
    console.error('保存分类失败:', error);
    return NextResponse.json({ 
      error: '保存分类失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 

// 根据分类名称去重
function removeDuplicateCategories(categories: NoteCategory[]): NoteCategory[] {
  const nameMap = new Map<string, NoteCategory>();
  
  // 按照顺序处理，如果有重名的，保留最后一个
  categories.forEach(category => {
    nameMap.set(category.name.toLowerCase(), category);
  });
  
  // 确保"其他"分类总是存在
  if (!nameMap.has('其他'.toLowerCase())) {
    const otherCategory = categories.find(c => c.name === '其他') || {
      id: 'other',
      name: '其他',
      description: '未分类的笔记'
    };
    nameMap.set('其他'.toLowerCase(), otherCategory);
  }
  
  return Array.from(nameMap.values());
} 