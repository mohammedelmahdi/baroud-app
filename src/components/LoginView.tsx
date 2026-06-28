import React, { useState } from 'react';
import { Rider, UserRole } from '../types';
import { Eye, EyeOff, Lock, User as UserIcon, BookOpen } from 'lucide-react';

interface LoginViewProps {
  riders: Rider[];
  onLoginSuccess: (session: { role: UserRole; username: string; name: string; riderId?: string }) => void;
  onNavigateToClient: () => void;
}

export default function LoginView({ riders, onLoginSuccess, onNavigateToClient }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    // Check Admin login
    if (username.toLowerCase() === 'admin') {
      onLoginSuccess({
        role: 'admin',
        username: 'admin',
        name: 'مدير الجمعية',
      });
      return;
    }

    // Check Rider login
    const foundRider = riders.find(
      (r) => r.username.toLowerCase() === username.toLowerCase().trim()
    );

    if (foundRider) {
      // In a real app we'd check hash, here we match password or 'password123' if not set
      const expectedPassword = foundRider.password || 'password123';
      if (password === expectedPassword) {
        onLoginSuccess({
          role: 'rider',
          username: foundRider.username,
          name: foundRider.name,
          riderId: foundRider.id,
        });
        return;
      }
    }

    setError('اسم المستخدم أو كلمة المرور غير صحيحة');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background with cinematic image */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover filter brightness-[0.25]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoYWuP0BOQi0YZ0jxqqhPwkK2lI_NcRuSNV6SB7i8Nkkh2nvhueN5Z9F-ANt5gF-dvciQBQqDw4_b-kpuvjcsyDKqB8Cm2xFlsSC8hrNdfU5I-4PZqpGVUzSrtqWkuJFsoRba1q5n7khWrmj1cnf_O1KTDr0F4kvkWIT9mhPRS1FV-lVHvfdYEDphUcbb-auz60xNFK5r_13udW-JBgMcQMWm0YbuJkcQUvoLayFBfKgy_Z4IZhaXSh5mf4YmPR5ME9-r1ku-UvBs"
          alt="Algerian Fantasia Rider"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      {/* Floating glassmorphism card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl shadow-2xl glass-panel border border-white/15 text-center animate-fade-in">
        <div className="mb-6">
          <h1 className="text-white font-bold text-4xl mb-2 font-headline tracking-wider">GAC</h1>
          <p className="text-slate-300 font-medium text-sm">نظام إدارة الجمعية الأصيل</p>
          <p className="text-xs text-indigo-400 font-medium mt-1">جمعية البارود والخيالة الجزائرية</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 text-right" dir="rtl">
          {error && (
            <div className="p-3 bg-red-500/15 text-red-300 text-sm rounded-lg border border-red-500/30 text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300 mr-1">اسم المستخدم</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <UserIcon size={18} />
              </span>
              <input
                type="text"
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-white/10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white/5 text-white text-sm transition-all placeholder-slate-500"
                placeholder="أدخل اسم المستخدم (مثال: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300 mr-1">كلمة المرور</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pr-10 pl-12 py-3 rounded-xl border border-white/10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white/5 text-white text-sm transition-all placeholder-slate-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 btn-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 cursor-pointer border border-white/10"
          >
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col items-center gap-3">
          <button
            onClick={onNavigateToClient}
            className="text-xs font-semibold text-indigo-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen size={14} />
            <span>عرض صفحة الحجز العامة للجمهور</span>
          </button>
          
          <p className="text-slate-500 text-[11px]">
            حقوق الطبع محفوظة © 2024 جمعية البارود الأصيل
          </p>
        </div>
      </div>
    </div>
  );
}
