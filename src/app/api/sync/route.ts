import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getUserId } from '@/lib/db';
import { validateAccessCode } from '@/lib/auth';

// 检查同步状态
export async function GET(request: NextRequest) {
  // 检查是否启用了同步
  if (process.env.ENABLE_SYNC !== 'true') {
    return NextResponse.json({ 
      enabled: false,
      message: '未启用多设备同步功能'
    });
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
    // 测试数据库连接
    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ 
        error: '数据库连接失败',
        enabled: false
      }, { status: 500 });
    }

    // 获取用户ID
    const userId = await getUserId(accessCode);

    return NextResponse.json({ 
      enabled: true,
      userId,
      message: '多设备同步功能已启用'
    });
  } catch (error) {
    console.error('同步状态检查失败:', error);
    return NextResponse.json({ 
      error: '同步状态检查失败',
      enabled: false
    }, { status: 500 });
  }
} 