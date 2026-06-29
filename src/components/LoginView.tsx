import React, { useState } from 'react';
import { Rider, UserRole } from '../types';
import { Eye, EyeOff, Lock, User as UserIcon, BookOpen } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface LoginViewProps {
  riders: Rider[];
  onLoginSuccess: (session: { role: UserRole; username: string; name: string; riderId?: string }) => void;
  onNavigateToClient: () => void;
  appName?: string;
}

export default function LoginView({ riders, onLoginSuccess, onNavigateToClient, appName = 'GAC' }: LoginViewProps) {
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

    // Check Admin login - block username/password as requested
    if (username.toLowerCase().trim() === 'admin') {
      setError('تسجيل دخول مدير النظام متاح عبر حساب Google فقط.');
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

  const handleGoogleAdminLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email) {
        setError('تعذر الحصول على البريد الإلكتروني من حساب Google');
        return;
      }
      
      const allowedAdminEmails = [
        'mohammed.inezarene@gmail.com',
      ];
      
      if (allowedAdminEmails.includes(user.email.toLowerCase())) {
        onLoginSuccess({
          role: 'admin',
          username: 'admin',
          name: user.displayName || 'مدير الجمعية',
        });
      } else {
        setError(`عذراً، الحساب (${user.email}) ليس مسجلاً كمدير للنظام.`);
        await auth.signOut();
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('تم إلغاء عملية تسجيل الدخول');
      } else {
        setError(`خطأ أثناء تسجيل الدخول بـ Google: ${err.message || String(err)}`);
      }
    }
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
          <h1 className="text-white font-bold text-4xl mb-2 font-headline tracking-wider">{appName}</h1>
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
            className="w-full py-3.5 btn-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 cursor-pointer border border-white/10 text-sm"
          >
            تسجيل الدخول للفرسان
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative bg-[#0b0f19] px-3 text-[11px] text-slate-400 font-medium">
              بوابة الإدارة والتحكم
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer border border-slate-300 text-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>تسجيل دخول المدير عبر Google</span>
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
