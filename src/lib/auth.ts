// 验证访问码
export async function validateAccessCode(code: string): Promise<boolean> {
  console.log('验证访问码:', code);
  console.log('环境变量:', {
    ACCESS_CODES: process.env.ACCESS_CODES,
    NEXT_PUBLIC_ACCESS_CODE: process.env.NEXT_PUBLIC_ACCESS_CODE,
    ACCESS_CODE: process.env.ACCESS_CODE
  });

  // 开发环境下的默认访问码，确保本地开发时可以访问
  const DEV_ACCESS_CODE = '123456';
  
  // 首先检查是否配置了多个访问码
  const accessCodesStr = process.env.ACCESS_CODES;
  if (accessCodesStr) {
    const accessCodes = accessCodesStr.split(',').map(c => c.trim());
    console.log('配置的访问码:', accessCodes);
    const result = accessCodes.includes(code);
    console.log('验证结果:', result);
    return result;
  }
  
  // 兼容原来的单个访问码
  const requiredCode = process.env.NEXT_PUBLIC_ACCESS_CODE || process.env.ACCESS_CODE;

  if (!requiredCode) {
    console.warn('访问码未配置，使用开发环境默认访问码');
    // 如果环境变量未配置，使用默认访问码（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      return code === DEV_ACCESS_CODE;
    }
    return false; // 在生产环境中，如果访问码未配置，不允许访问
  }

  const result = code === requiredCode;
  console.log('单访问码验证结果:', result);
  return result;
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