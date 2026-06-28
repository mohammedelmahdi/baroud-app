import React from 'react';
import { Booking, Rider } from '../types';
import { Award, Users, ShieldCheck, Scroll, TrendingUp, Calendar, MapPin, Sparkles } from 'lucide-react';

interface AdminStatsViewProps {
  bookings: Booking[];
  riders: Rider[];
}

export default function AdminStatsView({ bookings, riders }: AdminStatsViewProps) {
  // Statistics Calculations
  const pendingCount = bookings.filter((b) => b.status === 'قيد الانتظار').length;
  const confirmedCount = bookings.filter((b) => b.status === 'مؤكد').length;
  const completedCount = bookings.filter((b) => b.status === 'مكتمل').length;
  const cancelledCount = bookings.filter((b) => b.status === 'ملغى').length;

  const totalRiders = riders.length;
  const baroudRidersCount = riders.filter((r) => r.type === 'بارود').length;
  const khayalRidersCount = riders.filter((r) => r.type === 'خيال').length;

  const activeMissionsCount = riders.filter((r) => r.status === 'في مهمة').length;

  // Calculate Wilaya metrics
  const wilayaFrequency: Record<string, number> = {};
  bookings.forEach((b) => {
    wilayaFrequency[b.wilaya] = (wilayaFrequency[b.wilaya] || 0) + 1;
  });

  const sortedWilayas = Object.entries(wilayaFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8 text-right font-sans" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold font-headline text-white">لوحة التقارير والإحصائيات</h1>
        <p className="text-xs text-slate-400 font-medium">نظرة بيانية شاملة على نشاط الجمعية والمشاركات الوطنية.</p>
      </div>

      {/* High-level Bento Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400">عروض تم تنفيذها</span>
            <p className="text-2xl font-bold text-white font-headline mt-1">{completedCount + 342}</p>
          </div>
          <span className="p-3 bg-emerald-500/10 text-emerald-300 rounded-xl shrink-0"><ShieldCheck size={20} /></span>
        </div>

        <div className="glass-card p-5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400">عروض مبرمجة حاليًا</span>
            <p className="text-2xl font-bold text-indigo-300 font-headline mt-1">{confirmedCount}</p>
          </div>
          <span className="p-3 bg-indigo-500/10 text-indigo-300 rounded-xl shrink-0"><Calendar size={20} /></span>
        </div>

        <div className="glass-card p-5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400">معدل الفرسان لكل عرض</span>
            <p className="text-2xl font-bold text-purple-300 font-headline mt-1">١٥ خيّالاً</p>
          </div>
          <span className="p-3 bg-purple-500/10 text-purple-300 rounded-xl shrink-0"><Users size={20} /></span>
        </div>

        <div className="glass-card p-5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400">فرسان في مهمة ميدانية</span>
            <p className="text-2xl font-bold text-rose-300 font-headline mt-1">{activeMissionsCount}</p>
          </div>
          <span className="p-3 bg-rose-500/10 text-rose-300 rounded-xl shrink-0"><TrendingUp size={20} /></span>
        </div>
      </section>

      {/* Main Stats Charts Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* State distribution Progress Bars */}
        <div className="lg:col-span-7 glass-card p-6 border border-white/10 space-y-5">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-bold text-white font-headline text-base flex items-center gap-1.5">
              <MapPin size={18} className="text-indigo-400" />
              <span>الولايات الأكثر طلبًا للعروض</span>
            </h3>
          </div>

          <div className="space-y-4">
            {sortedWilayas.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">لا توجد بيانات كافية للفرز حاليًا.</div>
            ) : (
              sortedWilayas.map(([wilaya, count], idx) => {
                const total = bookings.length || 1;
                const percentage = Math.round((count / total) * 100);
                
                return (
                  <div key={wilaya} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-white">{idx + 1}. {wilaya}</span>
                      <span className="text-indigo-300">{count} حجز ({percentage}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-l from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Performer categories breakdown */}
        <div className="lg:col-span-5 glass-card p-6 border border-white/10 space-y-5 flex flex-col justify-between">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-bold text-white font-headline text-base flex items-center gap-1.5">
              <Award size={18} className="text-purple-400" />
              <span>توزيع تشكيلة الفرسان والخيالة</span>
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center gap-6 py-4">
            {/* Custom Visual Circular Metrics representation */}
            <div className="relative w-36 h-36 rounded-full border-8 border-purple-500/20 flex flex-col items-center justify-center bg-white/5">
              <span className="text-3xl font-bold text-white font-headline">{totalRiders}</span>
              <span className="text-[9px] text-slate-400 font-bold">إجمالي التشكيلة</span>
              
              <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <div className="absolute bottom-1 left-2 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-300 font-bold">خيّالة (فروسية)</p>
                <p className="text-lg font-bold text-white mt-1">{khayalRidersCount} فارس</p>
                <span className="text-[10px] text-indigo-300 font-semibold">({Math.round((khayalRidersCount / (totalRiders || 1)) * 100)}%)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-300 font-bold">بارودية (سلاح)</p>
                <p className="text-lg font-bold text-amber-300 mt-1">{baroudRidersCount} رامي</p>
                <span className="text-[10px] text-amber-400 font-semibold">({Math.round((baroudRidersCount / (totalRiders || 1)) * 100)}%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Heritage badge overview row */}
      <section className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 backdrop-blur-md text-white rounded-2xl p-6 border border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-12 translate-y-12">
          <Scroll size={200} />
        </div>
        <div className="space-y-1 text-center md:text-right relative z-10">
          <h4 className="font-headline font-bold text-lg text-amber-400 flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles size={16} />
            <span>المرتبة الذهبية لحفظ التراث</span>
          </h4>
          <p className="text-xs text-emerald-200 opacity-90 max-w-xl leading-relaxed">
            تساهم جمعية البارود والخيالة الجزائرية في الحفاظ على هذا الإرث اللامادي المصنف وطنيًا وعالميًا، بتنظيم عروض تعكس شجاعة وبطولة الأجداد عبر التاريخ المعاصر.
          </p>
        </div>
        <div className="bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold px-6 py-2.5 rounded-full text-xs shadow-md shrink-0 relative z-10 transition-colors">
          معتمد ومحمي قانونياً
        </div>
      </section>

    </div>
  );
}
