// 验证访问码
export async function validateAccessCode(code: string): Promise<boolean> {
  // 添加调试日志
  console.log('环境变量检查:', {
    ACCESS_CODES: process.env.ACCESS_CODES,
    NEXT_PUBLIC_ACCESS_CODE: process.env.NEXT_PUBLIC_ACCESS_CODE,
    ACCESS_CODE: process.env.ACCESS_CODE
  });

  // 首先检查是否配置了多个访问码
  const accessCodesStr = process.env.ACCESS_CODES;
  if (accessCodesStr) {
    const accessCodes = accessCodesStr.split(',').map(c => c.trim());
    console.log('多访问码模式:', accessCodes);
    return accessCodes.includes(code);
  }
  
  // 兼容原来的单个访问码
  const requiredCode = process.env.NEXT_PUBLIC_ACCESS_CODE || process.env.ACCESS_CODE;

  if (!requiredCode) {
    console.warn('访问码未配置');
    return true; // 临时修改回来，允许访问以便调试
  }

  console.log('单访问码模式:', { requiredCode, inputCode: code });
  return code === requiredCode;
}

// 获取当前用户的访问码
export function getCurrentAccessCode(): string | null {
  if (typeof window === 'undefined') return null;
  
  return sessionStorage.getItem('note-memo-access-code');
}

// 检查是否已经验证过
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const authStatus = sessionStorage.getItem('note-memo-auth');
  return authStatus === 'true';
}

// 设置验证状态
export function setAuthenticated(status: boolean, accessCode?: string): void {
  if (typeof window === 'undefined') return;

  if (status) {
    sessionStorage.setItem('note-memo-auth', 'true');
    if (accessCode) {
      sessionStorage.setItem('note-memo-access-code', accessCode);
    }
  } else {
    sessionStorage.removeItem('note-memo-auth');
    sessionStorage.removeItem('note-memo-access-code');
  }
}

// 格式化访问码输入
export function formatAccessCode(input: string): string {
  // 只保留数字，限制长度为6位
  return input.replace(/\D/g, '').slice(0, 6);
}