import React from 'react';
import { NavigationTab } from '../types';
import { CalendarRange, Users, Calendar, LineChart, LogOut, MapPin, User } from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onLogout: () => void;
  ownerName: string;
  appName: string;
  ownerPicture: string;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  ownerName,
  appName,
  ownerPicture
}: SidebarProps) {
  const navItems = [
    { id: 'bookings', label: 'الحجوزات', icon: CalendarRange },
    { id: 'riders', label: 'المشاركون', icon: Users },
    { id: 'calendar', label: 'التقويم', icon: Calendar },
    { id: 'stats', label: 'الإحصائيات', icon: LineChart },
    { id: 'profile', label: 'الملف الشخصي', icon: User }
  ] as const;

  return (
    <aside className="hidden lg:flex flex-col fixed right-0 top-0 h-full z-40 bg-slate-950/40 backdrop-blur-2xl border-l border-white/10 w-80 shadow-2xl pt-20 text-right font-sans" dir="rtl">
      <div className="p-6 flex flex-col items-end gap-6 h-full">
        
        {/* Admin profile header detail */}
        <button
          onClick={() => onTabChange('profile')}
          className="w-full flex flex-row items-center gap-4 border-b border-white/5 pb-6 text-right hover:bg-white/[0.03] p-2 rounded-xl transition-all group cursor-pointer"
          title="عرض الملف الشخصي والإعدادات"
        >
          <div className="w-14 h-14 rounded-full bg-indigo-950/50 overflow-hidden shrink-0 border-2 border-white/10 group-hover:border-indigo-400 transition-all">
            <img
              className="w-full h-full object-cover"
              src={ownerPicture || undefined}
              alt="Association Manager Profile"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold text-slate-100 font-headline group-hover:text-indigo-300 transition-colors">{ownerName}</h2>
            <p className="text-[10px] text-indigo-200/60 font-medium mt-1 truncate max-w-[150px]">{appName}</p>
          </div>
        </button>

        {/* Vertical Menu Nav List */}
        <nav className="w-full space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex flex-row items-center rounded-xl px-4 py-3.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-bold border border-white/10 translate-x-[-4px] shadow-lg shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                <IconComponent size={18} className="ml-3 shrink-0 opacity-80" />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="w-full space-y-3 pt-4 border-t border-white/5 mt-auto">
          {/* Firestore Active Connection Status Badge */}
          <div className="bg-emerald-950/20 p-3 rounded-xl flex items-center justify-between border border-emerald-900/30 w-full" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-bold text-emerald-400">قاعدة البيانات نشطة</p>
            </div>
            <p className="text-[10px] text-emerald-300/70 font-medium">Firestore متصل</p>
          </div>

          <div className="bg-white/[0.02] p-3.5 rounded-xl flex items-center gap-3 border border-white/5">
            <MapPin size={16} className="text-indigo-400" />
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium">الولاية والمقر الرئيسي</p>
              <p className="text-xs font-bold text-slate-200 mt-0.5">الجزائر العاصمة، الجزائر</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-900/30"
          >
            <LogOut size={14} />
            <span>تسجيل خروج المدير</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
