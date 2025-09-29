import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/mongodb';

// 测试MongoDB连接
export async function GET() {
  try {
    const isConnected = await checkConnection();
    
    if (isConnected) {
      return NextResponse.json({ status: 'success', message: 'MongoDB连接成功' });
    } else {
      return NextResponse.json({ status: 'error', message: 'MongoDB连接失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('测试MongoDB连接失败:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: '测试MongoDB连接失败', 
        error: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
} 