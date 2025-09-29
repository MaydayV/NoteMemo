import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getUserId, getAllDevicesSyncInfo } from '@/lib/db';
import { validateAccessCode } from '@/lib/auth';

// 检查同步状态
export async function GET(request: NextRequest) {
  console.log('GET /api/sync - 检查同步状态');
  
  // 检查是否启用了同步
  if (process.env.ENABLE_SYNC !== 'true') {
    console.log('同步功能未启用');
    return NextResponse.json({ 
      enabled: false,
      message: '未启用多设备同步功能'
    });
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
    console.log('测试数据库连接...');
    // 测试数据库连接
    const { db } = await connectToDatabase();
    if (!db) {
      console.error('数据库连接失败');
      return NextResponse.json({ 
        error: '数据库连接失败',
        enabled: false
      }, { status: 500 });
    }

    console.log('获取用户ID...');
    // 获取用户ID
    const userId = await getUserId(accessCode);
    console.log('用户ID:', userId);
    
    // 获取所有设备的同步信息
    const syncInfo = await getAllDevicesSyncInfo(userId);
    console.log('同步信息:', syncInfo);

    return NextResponse.json({ 
      enabled: true,
      userId,
      syncInfo,
      message: '多设备同步功能已启用'
    });
  } catch (error) {
    console.error('同步状态检查失败:', error);
    return NextResponse.json({ 
      error: '同步状态检查失败',
      message: error instanceof Error ? error.message : '未知错误',
      enabled: false
    }, { status: 500 });
  }
} 