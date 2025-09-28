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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (accessCode.length !== 6) {
      setError('请输入6位访问码');
      setIsLoading(false);
      return;
    }

    if (validateAccessCode(accessCode)) {
      setAuthenticated(true);
      onAuthenticated();
    } else {
      setError('访问码错误，请重试');
      setAccessCode('');
    }

    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccessCode(e.target.value);
    setAccessCode(formatted);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
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

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>极简笔记备忘录</p>
        </div>
      </div>
    </div>
  );
}