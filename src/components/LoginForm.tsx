'use client';

import { useState } from 'react';
import { validateAccessCode, setAuthenticated, formatAccessCode } from '@/lib/auth';

interface LoginFormProps {
  onAuthenticated: () => void;
}

export default function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (accessCode.length !== 6) {
      setError('请输入6位访问码');
      setIsLoading(false);
      return;
    }

    try {
      console.log('验证访问码:', accessCode);
      // 使用异步验证方法
      const isValid = await validateAccessCode(accessCode);
      
      if (isValid) {
        console.log('访问码验证成功');
        // 保存访问码以便后续使用
        setAuthenticated(true, accessCode);
        onAuthenticated();
      } else {
        console.error('访问码验证失败');
        setError('访问码错误，请重试');
        setAccessCode('');
      }
    } catch (error) {
      console.error('验证访问码时出错:', error);
      setError('验证失败，请稍后再试');
    }

    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccessCode(e.target.value);
    setAccessCode(formatted);
    if (error) setError('');
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="h-16 w-16 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-light text-black mb-2">NoteMemo</h1>
          <p className="text-gray-600">请输入访问码</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={accessCode}
              onChange={handleInputChange}
              placeholder="6位访问码"
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 focus:outline-none text-center text-2xl tracking-widest font-mono"
              maxLength={6}
              autoComplete="off"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || accessCode.length !== 6}
            className="w-full py-3 px-4 border border-transparent text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '验证中...' : '进入'}
          </button>
        </form>

        <div className="mt-8 flex justify-center items-center">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              <a href="https://github.com/MaydayV" target="_blank" rel="noopener noreferrer" className="hover:underline">
                © MaydayV
              </a> • 
              <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="hover:underline ml-1">
                MIT License
              </a>
            </p>
            <div className="mt-2 flex items-center justify-center">
              <button 
                onClick={toggleInfo}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                title="显示信息"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            
            {showInfo && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-500">
                <p>默认访问码: 123456</p>
                {process.env.ENABLE_SYNC === 'true' && (
                  <p className="mt-1">多设备同步已启用</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}