import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle, Clock, Sparkles, X, Check, Trash2, Calendar, MapPin } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationBellProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClear: () => void;
  currentUserRole: 'admin' | 'rider';
  currentRiderId?: string;
}

export default function NotificationBell({
  notifications,
  onMarkAsRead,
  onClear,
  currentUserRole,
  currentRiderId,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications based on role
  const filteredNotifications = notifications.filter((n) => {
    if (currentUserRole === 'admin') {
      return !n.targetUserId || n.targetUserId === 'admin';
    } else {
      return n.targetUserId === currentRiderId;
    }
  });

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateString = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ar-DZ', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return isoString;
    }
  };

  const handleMarkAllRead = () => {
    filteredNotifications.forEach((n) => {
      if (!n.isRead) {
        onMarkAsRead(n.id);
      }
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/5 text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none flex items-center justify-center border border-white/5"
        title="الإشعارات"
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-bounce' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:-right-2 sm:top-full sm:mt-3 sm:w-[360px] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden text-right"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-xs sm:text-sm font-headline">مركز الإشعارات</h4>
                {unreadCount > 0 && (
                  <span className="bg-rose-500/10 text-rose-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-rose-500/20">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[9px] sm:text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
                {filteredNotifications.length > 0 && (
                  <button
                    onClick={onClear}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="حذف جميع الإشعارات"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[280px] sm:max-h-[360px] overflow-y-auto divide-y divide-white/5 custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="py-10 px-4 text-center text-slate-400 text-xs font-medium space-y-2">
                  <Bell className="mx-auto text-slate-600 mb-1" size={28} />
                  <p>لا توجد إشعارات حالياً.</p>
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && onMarkAsRead(n.id)}
                      className={`p-3 transition-all flex items-start gap-2.5 cursor-pointer ${
                        n.isRead ? 'opacity-70 bg-transparent' : 'bg-indigo-500/5 hover:bg-indigo-500/10'
                      }`}
                    >
                      {/* Icon based on notification type */}
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        n.type === 'new_booking'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : n.type === 'rider_assignment'
                          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}>
                        {n.type === 'new_booking' ? (
                          <Calendar size={13} />
                        ) : n.type === 'rider_assignment' ? (
                          <Sparkles size={13} />
                        ) : (
                          <CheckCircle size={13} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center justify-between gap-1.5 mb-0.5">
                          <p className={`font-bold truncate ${n.isRead ? 'text-slate-300' : 'text-white'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed font-medium">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                          <Clock size={9} />
                          <span>{formatDateString(n.createdAt)}</span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-1.5 border-t border-white/5 bg-slate-950/40 text-center">
              <span className="text-[9px] text-slate-500 font-semibold font-mono">
                جمعية اللاعبين والبارود الفانتازيا
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
