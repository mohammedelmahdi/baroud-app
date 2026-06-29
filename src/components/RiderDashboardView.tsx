import React from 'react';
import { Booking, Rider } from '../types';
import { Calendar, MapPin, User, PhoneCall, Sparkles, LogOut } from 'lucide-react';

interface RiderDashboardViewProps {
  rider: Rider;
  bookings: Booking[];
  onLogout: () => void;
  appName?: string;
}

export default function RiderDashboardView({ rider, bookings, onLogout, appName = 'GAC' }: RiderDashboardViewProps) {
  // Get assignments dynamically
  const assignedBookings = bookings.filter((b) => b.assignedRiders.includes(rider.id));

  // Map state to a formatted readable Arabic day/date
  const formatDateArabic = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      // Fallback custom formatting if needed, but standard localized is elegant:
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      return dateObj.toLocaleDateString('ar-DZ', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen pb-24 text-right bg-slate-950 text-slate-100 relative overflow-hidden" dir="rtl">
      {/* Background Decorative Cosmic Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar tailored for Rider Portal */}
      <nav className="flex flex-row justify-between items-center w-full px-5 md:px-10 h-16 z-50 bg-slate-900/40 backdrop-blur-md border-b border-white/10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
            <img
              className="w-full h-full object-cover"
              src={rider.image || undefined}
              alt={rider.name}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-sm leading-none">{rider.name}</p>
            <p className="text-slate-400 text-[10px] mt-1 font-medium">عضو الخيالة المعتمد</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white font-headline tracking-wider">{appName}</h1>

        <button
          onClick={onLogout}
          className="flex items-center justify-center w-9 h-9 rounded-full text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer border border-red-500/20"
          title="تسجيل الخروج"
        >
          <LogOut size={16} />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-5 md:px-10 pt-8 space-y-6 relative z-10">
        
        {/* Header Title Section */}
        <header className="mb-6">
          <h2 className="text-xl font-bold text-white font-headline mb-2 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" />
            <span>العروض والأعراس المكلف بها</span>
          </h2>
          <div className="h-1 w-20 bg-indigo-500 rounded-full" />
        </header>

        {/* Wedding / Bookings List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedBookings.length === 0 ? (
            <div className="col-span-full text-center py-16 glass-card border border-dashed border-white/10 text-slate-400 font-semibold text-sm">
              لا توجد عروض أو أعراس مكلف بها حاليًا. متاح دائمًا للاستدعاء!
            </div>
          ) : (
            assignedBookings.map((booking) => {
              const isPending = booking.status === 'قيد الانتظار';
              
              return (
                <div
                  key={booking.id}
                  className="glass-card p-6 border border-white/10 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        isPending
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                          : booking.status === 'مؤكد'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                          : 'bg-slate-500/10 text-slate-300 border-slate-500/25'
                      }`}
                    >
                      {booking.status}
                    </span>
                    
                    {/* Visual traditional celebration accent background */}
                    <span className="text-indigo-400/10 absolute -left-2 -top-2 opacity-15 transform -rotate-12 group-hover:scale-110 transition-transform">
                      <Sparkles size={56} />
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Date Block */}
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/5 text-indigo-400 flex items-center justify-center shrink-0 border border-white/5">
                        <Calendar size={15} />
                      </span>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold">التاريخ والوقت</p>
                        <p className="text-white text-xs font-bold mt-0.5">
                          {formatDateArabic(booking.date)}
                        </p>
                      </div>
                    </div>

                    {/* Route Location Block */}
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/5 text-indigo-400 flex items-center justify-center shrink-0 border border-white/5">
                        <MapPin size={15} />
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-400 text-[10px] font-bold">مسار الانطلاق والوصول</p>
                        <p className="text-slate-200 text-xs font-semibold mt-0.5 leading-relaxed">
                          {booking.startPoint} ← {booking.endPoint}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info Block */}
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/5 text-indigo-400 flex items-center justify-center shrink-0 border border-white/5">
                        <User size={15} />
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-400 text-[10px] font-bold">اسم الزبون وصاحب الحفل</p>
                        <p className="text-white font-bold text-base mt-0.5">
                          {booking.customerName}
                        </p>
                      </div>
                    </div>

                    {/* Direct Contact CTA Option */}
                    <a
                      href={`tel:${booking.phone}`}
                      className="mt-4 flex items-center justify-between w-full p-4 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors border border-white/10 hover:border-indigo-500/30 group-hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <PhoneCall size={16} className="text-indigo-400 animate-pulse" />
                        <span className="font-bold text-sm tracking-wide text-white">{booking.phone}</span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                        اتصال بالزبون
                      </span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
