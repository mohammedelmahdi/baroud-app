import React from 'react';
import { NavigationTab } from '../types';
import { CalendarRange, Users, Calendar, LineChart, Plus } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onQuickAction: () => void;
}

export default function BottomNavBar({ activeTab, onTabChange, onQuickAction }: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex flex-row justify-around items-center h-20 px-2 pb-safe bg-slate-900/60 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.4)] rounded-t-3xl lg:hidden text-center" dir="rtl">
      
      {/* Bookings Link */}
      <button
        onClick={() => onTabChange('bookings')}
        className={`flex flex-col items-center justify-center flex-1 py-2 cursor-pointer transition-all ${
          activeTab === 'bookings' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-indigo-300'
        }`}
      >
        <CalendarRange size={20} className={activeTab === 'bookings' ? 'stroke-[2.5px]' : ''} />
        <span className="text-[10px] mt-1 font-medium">الحجوزات</span>
      </button>

      {/* Riders Link */}
      <button
        onClick={() => onTabChange('riders')}
        className={`flex flex-col items-center justify-center flex-1 py-2 cursor-pointer transition-all ${
          activeTab === 'riders' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-indigo-300'
        }`}
      >
        <Users size={20} className={activeTab === 'riders' ? 'stroke-[2.5px]' : ''} />
        <span className="text-[10px] mt-1 font-medium">المشاركون</span>
      </button>

      {/* Floating Center Action */}
      <div className="relative -top-5 shrink-0 px-2">
        <button
          onClick={onQuickAction}
          className="w-13 h-13 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-90 hover:scale-105 transition-all cursor-pointer border border-white/15"
          title="حجز سريع"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Calendar Link */}
      <button
        onClick={() => onTabChange('calendar')}
        className={`flex flex-col items-center justify-center flex-1 py-2 cursor-pointer transition-all ${
          activeTab === 'calendar' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-indigo-300'
        }`}
      >
        <Calendar size={20} className={activeTab === 'calendar' ? 'stroke-[2.5px]' : ''} />
        <span className="text-[10px] mt-1 font-medium">التقويم</span>
      </button>

      {/* Stats Link */}
      <button
        onClick={() => onTabChange('stats')}
        className={`flex flex-col items-center justify-center flex-1 py-2 cursor-pointer transition-all ${
          activeTab === 'stats' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-indigo-300'
        }`}
      >
        <LineChart size={20} className={activeTab === 'stats' ? 'stroke-[2.5px]' : ''} />
        <span className="text-[10px] mt-1 font-medium">الإحصائيات</span>
      </button>

    </nav>
  );
}
