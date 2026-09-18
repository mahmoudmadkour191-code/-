import React, { useState } from 'react';
import { loginAdmin } from '../../lib/api';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginWith = async (passToUse: string) => {
    setPassword(passToUse);
    setError(null);
    setIsLoading(true);
    try {
      await loginAdmin(passToUse);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPw = password.trim();
    if (!cleanPw) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loginAdmin(cleanPw);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200/80 shadow-lg shadow-blue-900/5">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            لوحة إدارة فريق حِصّتي
          </h1>
          <p className="text-xs text-slate-500">
            أدخل كلمة المرور الخاصة بالإدارة للوصول وتعديل المحتوى والمطورين
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              كلمة مرور المشرف
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="أدخل كلمة المرور (admin123)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>كلمات المرور المقبولة:</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">دخول سريع بنقرة واحدة</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleLoginWith('admin123')}
                  className="text-xs font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer"
                >
                  admin123
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginWith('admin')}
                  className="text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer"
                >
                  admin
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginWith('hassty123')}
                  className="text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer"
                >
                  hassty123
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>تسجيل الدخول للوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium transition"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة إلى الصفحة الرئيسية للموقع</span>
          </button>
        </div>
      </div>
    </div>
  );
};