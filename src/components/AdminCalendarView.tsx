import React, { useState } from 'react';
import { Booking } from '../types';
import { Calendar as CalendarIcon, MapPin, Phone, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminCalendarViewProps {
  bookings: Booking[];
}

export default function AdminCalendarView({ bookings }: AdminCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6, 1)); // Set to July 2024 (seed data months)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>('2024-07-12');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthYearStr = currentDate.toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysCount = daysInMonth(year, month);
  const firstDay = firstDayIndex(year, month);

  // Generate date list
  const calendarCells: (Date | null)[] = [];
  // Fill leading empty cells
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  // Fill actual days
  for (let d = 1; d <= daysCount; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  // Find bookings for specific cells
  const getBookingsForDate = (date: Date) => {
    const localStr = date.toISOString().split('T')[0];
    return bookings.filter((b) => b.date === localStr);
  };

  // Selected date bookings
  const selectedDateBookings = selectedDateStr
    ? bookings.filter((b) => b.date === selectedDateStr)
    : [];

  return (
    <div className="space-y-8 text-right font-sans" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold font-headline text-white">التقويم التنسيقي</h1>
        <p className="text-xs text-slate-400 font-medium">متابعة مواعيد الأعراس وعروض الفانتازيا والبارود المبرمجة شهريًا.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid card */}
        <div className="lg:col-span-7 glass-card p-6 border border-white/10 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-bold text-white font-headline text-base">{monthYearStr}</h3>
            <div className="flex gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels in Arabic */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-indigo-300 pb-2 border-b border-white/5">
            <div>الأحد</div>
            <div>الإثنين</div>
            <div>الثلاثاء</div>
            <div>الأربعاء</div>
            <div>الخميس</div>
            <div>الجمعة</div>
            <div>السبت</div>
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              if (cell === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-white/5 rounded-lg" />;
              }

              const dateString = cell.toISOString().split('T')[0];
              const isSelected = selectedDateStr === dateString;
              const dateBookings = getBookingsForDate(cell);
              const hasBookings = dateBookings.length > 0;

              return (
                <button
                  key={`day-${cell.getDate()}`}
                  onClick={() => setSelectedDateStr(dateString)}
                  className={`aspect-square p-1 rounded-xl flex flex-col justify-between items-center border transition-all relative cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 border-white/15 text-white shadow-lg shadow-indigo-500/20 scale-105'
                      : 'border-white/10 hover:bg-white/5 text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold leading-none mt-1">{cell.getDate()}</span>
                  
                  {/* Indicator for bookings */}
                  {hasBookings && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mb-1 ${
                        isSelected ? 'bg-amber-400' : 'bg-purple-400'
                      }`}
                    />
                  )}

                  {/* Tiny hover list overlay on desktop */}
                  {hasBookings && !isSelected && (
                    <span className="absolute hidden md:group-hover:flex bottom-6 bg-slate-950 text-white text-[9px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-10 font-bold border border-white/10">
                      {dateBookings.length} عرض
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail View Panel */}
        <div className="lg:col-span-5 glass-card p-6 border border-white/10 space-y-4">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-bold text-white font-headline text-base flex items-center gap-1.5">
              <CalendarIcon size={18} className="text-purple-400" />
              <span>مواعيد يوم:</span>
              <span className="text-indigo-400 text-sm font-sans mr-1">
                {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' }) : 'لم يتم التحديد'}
              </span>
            </h3>
          </div>

          <div className="space-y-3.5 max-h-[400px] overflow-y-auto custom-scrollbar">
            {selectedDateBookings.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium border border-dashed border-white/10 rounded-xl bg-white/5">
                لا توجد عروض مبرمجة في هذا اليوم.
              </div>
            ) : (
              selectedDateBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors space-y-2.5 heritage-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{b.customerName}</h4>
                    <span className="text-[10px] font-bold bg-white/5 text-purple-300 border border-white/10 px-2 py-0.5 rounded-full">
                      {b.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-purple-400" />
                      <span>{b.ridersCount} خيالة</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-purple-400" />
                      <span>{b.wilaya}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 border-t border-white/5 pt-1.5 space-y-0.5">
                    <p><span className="font-semibold text-indigo-300">المسار:</span> {b.startPoint} ← {b.endPoint}</p>
                    <p className="flex items-center gap-1"><Phone size={11} className="text-indigo-400" /> {b.phone}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
