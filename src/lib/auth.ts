// 验证访问码
export function validateAccessCode(code: string): boolean {
  const requiredCode = process.env.NEXT_PUBLIC_ACCESS_CODE || process.env.ACCESS_CODE;

  if (!requiredCode) {
    console.warn('访问码未配置');
    return true; // 如果没有配置访问码，允许访问
  }

  return code === requiredCode;
}

// 检查是否已经验证过
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const authStatus = sessionStorage.getItem('note-memo-auth');
  return authStatus === 'true';
}

// 设置验证状态
export function setAuthenticated(status: boolean): void {
  if (typeof window === 'undefined') return;

  if (status) {
    sessionStorage.setItem('note-memo-auth', 'true');
  } else {
    sessionStorage.removeItem('note-memo-auth');
  }
}

// 格式化访问码输入
export function formatAccessCode(input: string): string {
  // 只保留数字，限制长度为6位
  return input.replace(/\D/g, '').slice(0, 6);
}