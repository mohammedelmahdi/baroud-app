import React, { useState } from 'react';
import { Booking, Rider } from '../types';
import { Award, Users, ShieldCheck, Scroll, TrendingUp, Calendar, MapPin, Sparkles, Scale, Hash, Coins, Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface AdminStatsViewProps {
  bookings: Booking[];
  riders: Rider[];
  ownedQuantityKg: number;
  ownedCount: number;
  onUpdateOwnedQuantityKg?: (qty: number) => void;
  onUpdateOwnedCount?: (count: number) => void;
}

export default function AdminStatsView({ 
  bookings, 
  riders, 
  ownedQuantityKg, 
  ownedCount,
  onUpdateOwnedQuantityKg,
  onUpdateOwnedCount
}: AdminStatsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'inventory' | 'payments'>('overview');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');

  // Stock Editing States
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [tempOwnedPowder, setTempOwnedPowder] = useState<number | string>(ownedQuantityKg);
  const [tempOwnedCount, setTempOwnedCount] = useState<number | string>(ownedCount);

  const handleStartEditing = () => {
    setTempOwnedPowder(ownedQuantityKg);
    setTempOwnedCount(ownedCount);
    setIsEditingStock(true);
  };

  const handleSaveStock = () => {
    if (onUpdateOwnedQuantityKg && tempOwnedPowder !== '') {
      onUpdateOwnedQuantityKg(Number(tempOwnedPowder));
    }
    if (onUpdateOwnedCount && tempOwnedCount !== '') {
      onUpdateOwnedCount(Number(tempOwnedCount));
    }
    setIsEditingStock(false);
  };

  // Statistics Calculations
  const pendingCount = bookings.filter((b) => b.status === 'قيد الانتظار').length;
  const confirmedCount = bookings.filter((b) => b.status === 'مؤكد').length;
  const completedCount = bookings.filter((b) => b.status === 'مكتمل').length;
  const cancelledCount = bookings.filter((b) => b.status === 'ملغى').length;

  const totalRiders = riders.length;
  const baroudRidersCount = riders.filter((r) => r.type === 'بارود').length;
  const khayalRidersCount = riders.filter((r) => r.type === 'خيال').length;

  // Get today's date string
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  // Find riders who have an active booking today (confirmed or completed only)
  const activeMissionsCount = riders.filter((r) => 
    bookings.some((b) => b.date === todayStr && (b.status === 'مؤكد' || b.status === 'مكتمل') && b.assignedRiders.includes(r.id))
  ).length;

  // Calculate dynamic average riders per booking (for confirmed or completed bookings only)
  const nonCancelledBookings = bookings.filter((b) => b.status === 'مؤكد' || b.status === 'مكتمل');
  const averageRiders = nonCancelledBookings.length > 0
    ? Math.round(nonCancelledBookings.reduce((sum, b) => sum + (b.ridersCount || 0), 0) / nonCancelledBookings.length)
    : 0;

  // Calculate supply quantities
  const totalQuantityKg = nonCancelledBookings.reduce((sum, b) => sum + (b.quantityKg || 0), 0);
  const totalCountRequired = nonCancelledBookings.reduce((sum, b) => sum + (b.count || 0), 0);

  // Calculate remaining stock
  const remainingQuantityKg = ownedQuantityKg - totalQuantityKg;
  const remainingCountRequired = ownedCount - totalCountRequired;

  // Financial statistics calculations
  const billingBookings = bookings.filter((b) => b.status !== 'ملغى');
  const totalProjectedRevenue = billingBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const collectedRevenue = billingBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const pendingRevenue = Math.max(0, totalProjectedRevenue - collectedRevenue);

  // Calculate Wilaya metrics
  const wilayaFrequency: Record<string, number> = {};
  bookings.forEach((b) => {
    wilayaFrequency[b.wilaya] = (wilayaFrequency[b.wilaya] || 0) + 1;
  });

  const sortedWilayas = Object.entries(wilayaFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8 text-right font-sans" dir="rtl" id="admin-stats-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="stats-header-section">
        <div>
          <h1 className="text-2xl font-bold font-headline text-white" id="stats-title">لوحة التقارير والإحصائيات</h1>
          <p className="text-xs text-slate-400 font-medium" id="stats-subtitle">نظرة بيانية شاملة على نشاط الجمعية والمشاركات الوطنية.</p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex bg-white/5 p-1 rounded-xl self-start sm:self-center border border-white/5" id="stats-tabs">
          <button
            id="btn-tab-overview"
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            التقارير العامة
          </button>
          <button
            id="btn-tab-inventory"
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>مراقبة المخزون</span>
            {(remainingQuantityKg < 0 || remainingCountRequired < 0) && (
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            id="btn-tab-payments"
            onClick={() => setActiveSubTab('payments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins size={14} />
            <span>تتبع المدفوعات</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'overview' && (
        <div className="space-y-8 animate-fade-in" id="overview-tab-content">
          {/* High-level Bento Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5" id="overview-bento-grid">
            <div className="glass-card p-4.5 border border-white/10 flex items-center justify-between" id="stat-card-completed">
              <div>
                <span className="text-[10px] font-bold text-slate-400">عروض تم تنفيذها</span>
                <p className="text-xl font-bold text-white font-headline mt-1">{completedCount}</p>
              </div>
              <span className="p-2.5 bg-emerald-500/10 text-emerald-300 rounded-xl shrink-0"><ShieldCheck size={18} /></span>
            </div>

            <div className="glass-card p-4.5 border border-white/10 flex items-center justify-between" id="stat-card-confirmed">
              <div>
                <span className="text-[10px] font-bold text-slate-400">عروض مبرمجة حاليًا</span>
                <p className="text-xl font-bold text-indigo-300 font-headline mt-1">{confirmedCount}</p>
              </div>
              <span className="p-2.5 bg-indigo-500/10 text-indigo-300 rounded-xl shrink-0"><Calendar size={18} /></span>
            </div>

            <div className="glass-card p-4.5 border border-white/10 flex items-center justify-between" id="stat-card-riders-avg">
              <div>
                <span className="text-[10px] font-bold text-slate-400">معدل الفرسان لكل عرض</span>
                <p className="text-xl font-bold text-purple-300 font-headline mt-1">{averageRiders} خيّالاً</p>
              </div>
              <span className="p-2.5 bg-purple-500/10 text-purple-300 rounded-xl shrink-0"><Users size={18} /></span>
            </div>

            <div className="glass-card p-4.5 border border-white/10 flex items-center justify-between" id="stat-card-active-missions">
              <div>
                <span className="text-[10px] font-bold text-slate-400">لاعبون في مهمة ميدانية</span>
                <p className="text-xl font-bold text-rose-300 font-headline mt-1">{activeMissionsCount}</p>
              </div>
              <span className="p-2.5 bg-rose-500/10 text-rose-300 rounded-xl shrink-0"><TrendingUp size={18} /></span>
            </div>

            <div className={`glass-card p-4.5 border flex items-center justify-between transition-colors ${
              remainingQuantityKg < 0 ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'
            }`} id="stat-card-remaining-powder">
              <div>
                <span className="text-[10px] font-bold text-slate-400">البارود المتبقي في المخزن</span>
                <p className={`text-xl font-bold font-headline mt-1 ${
                  remainingQuantityKg < 0 ? 'text-red-400' : 'text-amber-400'
                }`} dir="ltr">
                  {remainingQuantityKg.toFixed(2).replace(/\.00$/, '')} كغ
                </p>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  من أصل {ownedQuantityKg} كغ (المطلوب {totalQuantityKg.toFixed(1)})
                </span>
              </div>
              <span className={`p-2.5 rounded-xl shrink-0 ${
                remainingQuantityKg < 0 ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-300'
              }`}><Scale size={18} /></span>
            </div>

            <div className={`glass-card p-4.5 border flex items-center justify-between transition-colors ${
              remainingCountRequired < 0 ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'
            }`} id="stat-card-remaining-gear">
              <div>
                <span className="text-[10px] font-bold text-slate-400">الكبسول المتبقي في المخزن</span>
                <p className={`text-xl font-bold font-headline mt-1 ${
                  remainingCountRequired < 0 ? 'text-red-400' : 'text-teal-300'
                }`}>
                  {remainingCountRequired} حبة
                </p>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  من أصل {ownedCount} حبة (المطلوب {totalCountRequired})
                </span>
              </div>
              <span className={`p-2.5 rounded-xl shrink-0 ${
                remainingCountRequired < 0 ? 'bg-red-500/10 text-red-400' : 'bg-teal-500/10 text-teal-300'
              }`}><Hash size={18} /></span>
            </div>
          </section>

          {/* Main Stats Charts Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="overview-charts-section">
            
            {/* State distribution Progress Bars */}
            <div className="lg:col-span-7 glass-card p-6 border border-white/10 space-y-5" id="chart-card-wilayas">
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
            <div className="lg:col-span-5 glass-card p-6 border border-white/10 space-y-5 flex flex-col justify-between" id="chart-card-riders">
              <div className="border-b border-white/5 pb-3">
                <h3 className="font-bold text-white font-headline text-base flex items-center gap-1.5">
                  <Award size={18} className="text-purple-400" />
                  <span>توزيع تشكيلة اللاعبين</span>
                </h3>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center gap-6 py-4">
                {/* Custom Circular Metrics representation */}
                <div className="relative w-36 h-36 rounded-full border-8 border-purple-500/20 flex flex-col items-center justify-center bg-white/5">
                  <span className="text-3xl font-bold text-white font-headline">{totalRiders}</span>
                  <span className="text-[9px] text-slate-400 font-bold">إجمالي التشكيلة</span>
                  
                  <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <div className="absolute bottom-1 left-2 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full text-center">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-300 font-bold">لاعبون (فروسية)</p>
                    <p className="text-lg font-bold text-white mt-1">{khayalRidersCount} لاعب</p>
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
        </div>
      )}

      {activeSubTab === 'inventory' && (
        <div className="space-y-8 animate-fade-in" id="inventory-tab-content">
          {/* Detailed Stock Tracking with visual percentage indicators */}
          <section className="glass-card p-6 border border-white/10 space-y-6" id="stock-levels-section">
            <div className="border-b border-white/5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-headline font-bold text-base text-white flex items-center gap-2">
                <Scale className="text-amber-400" size={18} />
                <span>حالة المخزون الاستراتيجي ومستوى الاستهلاك للجمعية</span>
              </h3>
              {onUpdateOwnedQuantityKg && onUpdateOwnedCount && (
                <div className="flex items-center gap-2">
                  {isEditingStock && (
                    <button
                      type="button"
                      onClick={() => setIsEditingStock(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                    >
                      إلغاء
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={isEditingStock ? handleSaveStock : handleStartEditing}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isEditingStock 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20' 
                        : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20'
                    }`}
                  >
                    {isEditingStock ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>تأكيد وحفظ</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-400" />
                        <span>تعديل مستويات المخزون</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {isEditingStock && (
              <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>تحديث الرصيد الإجمالي المتوفر في مخزن الجمعية حالياً:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">إجمالي كمية البارود المتوفرة (كغ):</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        className="w-full bg-slate-950/50 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 text-right font-bold"
                        value={tempOwnedPowder}
                        onChange={(e) => setTempOwnedPowder(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="مثال: 50"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded" dir="rtl">كغ</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">إجمالي كمية الكبسول المتوفرة (حبة):</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-950/50 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 text-right font-bold"
                        value={tempOwnedCount}
                        onChange={(e) => setTempOwnedCount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="مثال: 1000"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded" dir="rtl">حبة</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Powder Consumption */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4" id="powder-progress-box">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">مخزون البارود الملتزم به</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">معدل استهلاك البارود المحجوز للعروض النشطة</p>
                  </div>
                  <span className="p-2 bg-amber-500/10 text-amber-300 rounded-lg text-xs font-bold" dir="ltr">
                    {totalQuantityKg.toFixed(1)} / {ownedQuantityKg} كغ
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        remainingQuantityKg < 0 ? 'bg-red-500' : 'bg-gradient-to-l from-amber-400 to-amber-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, (totalQuantityKg / (ownedQuantityKg || 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className={remainingQuantityKg < 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {remainingQuantityKg < 0 ? 'عجز في مخزن البارود!' : `المتبقي الصافي: ${remainingQuantityKg.toFixed(1)} كغ`}
                    </span>
                    <span className="text-slate-400">
                      {Math.round((totalQuantityKg / (ownedQuantityKg || 1)) * 100)}% مستهلك
                    </span>
                  </div>
                </div>

                {remainingQuantityKg < 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl flex items-start gap-2 text-xs" id="powder-deficit-alert">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">تحذير: عجز في مخزون البارود!</p>
                      <p className="opacity-80 text-[10px] mt-0.5">تحتاج إلى إضافة {Math.abs(remainingQuantityKg).toFixed(1)} كغ على الأقل في الإعدادات لتغطية متطلبات العروض النشطة.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Gear/Count Consumption */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4" id="gear-progress-box">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">مخزون الكبسول الملتزم به</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">معدل استهلاك حبات الكبسول المطلوبة من قبل أصحاب الحجوزات</p>
                  </div>
                  <span className="p-2 bg-teal-500/10 text-teal-300 rounded-lg text-xs font-bold">
                    {totalCountRequired} / {ownedCount} حبة
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        remainingCountRequired < 0 ? 'bg-red-500' : 'bg-gradient-to-l from-teal-400 to-teal-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, (totalCountRequired / (ownedCount || 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className={remainingCountRequired < 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {remainingCountRequired < 0 ? 'عجز في مخزون الكبسول!' : `المتبقي الصافي: ${remainingCountRequired} حبة`}
                    </span>
                    <span className="text-slate-400">
                      {Math.round((totalCountRequired / (ownedCount || 1)) * 100)}% مستهلك
                    </span>
                  </div>
                </div>

                {remainingCountRequired < 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl flex items-start gap-2 text-xs" id="gear-deficit-alert">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">تحذير: عجز في مخزون الكبسول!</p>
                      <p className="opacity-80 text-[10px] mt-0.5">تحتاج إلى توفير {Math.abs(remainingCountRequired)} حبة إضافية لتغطية متطلبات العروض النشطة.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {activeSubTab === 'payments' && (
        <div className="space-y-8 animate-fade-in" id="payments-tab-content">
          {/* Section 1: Financial summary widgets */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5" id="financial-summary-cards">
            <div className="glass-card p-5 border border-emerald-500/10 flex items-center justify-between" id="fin-projected-card">
              <div>
                <span className="text-[10px] font-bold text-slate-400">إجمالي قيمة الحجوزات</span>
                <p className="text-2xl font-bold text-emerald-400 font-headline mt-1" dir="ltr">
                  {totalProjectedRevenue.toLocaleString()} دج
                </p>
                <span className="text-[9px] text-slate-500 block mt-0.5">لكافة الحجوزات النشطة وغير الملغاة</span>
              </div>
              <span className="p-3 bg-emerald-500/10 text-emerald-300 rounded-2xl shrink-0"><Coins size={22} /></span>
            </div>

            <div className="glass-card p-5 border border-indigo-500/10 flex items-center justify-between" id="fin-collected-card">
              <div>
                <span className="text-[10px] font-bold text-slate-400">المبالغ المحصلة بالفعل</span>
                <p className="text-2xl font-bold text-indigo-300 font-headline mt-1" dir="ltr">
                  {collectedRevenue.toLocaleString()} دج
                </p>
                <span className="text-[9px] text-slate-500 block mt-0.5">المبالغ المدفوعة والمثبتة</span>
              </div>
              <span className="p-3 bg-indigo-500/10 text-indigo-300 rounded-2xl shrink-0"><CheckCircle2 size={22} /></span>
            </div>

            <div className="glass-card p-5 border border-amber-500/10 flex items-center justify-between" id="fin-pending-card">
              <div>
                <span className="text-[10px] font-bold text-slate-400">المستحقات المعلقة للتحصيل</span>
                <p className="text-2xl font-bold text-amber-400 font-headline mt-1" dir="ltr">
                  {pendingRevenue.toLocaleString()} دج
                </p>
                <span className="text-[9px] text-slate-500 block mt-0.5">المبالغ المتبقية للتحصيل والذمم</span>
              </div>
              <span className="p-3 bg-amber-500/10 text-amber-300 rounded-2xl shrink-0"><Clock size={22} /></span>
            </div>
          </section>

          {/* Section 2: Ledger Table */}
          <div className="glass-card border border-white/10 overflow-hidden" id="payments-ledger-table-card">
            <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2" id="ledger-filters">
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    paymentFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  الكل ({billingBookings.length})
                </button>
                <button
                  onClick={() => setPaymentFilter('paid')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    paymentFilter === 'paid' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  مدفوعة بالكامل ({billingBookings.filter(b => (b.totalPrice || 0) > 0 && (b.paidAmount || 0) >= (b.totalPrice || 0)).length})
                </button>
                <button
                  onClick={() => setPaymentFilter('partial')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    paymentFilter === 'partial' ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  مدفوعة جزئياً ({billingBookings.filter(b => (b.paidAmount || 0) > 0 && (b.paidAmount || 0) < (b.totalPrice || 0)).length})
                </button>
                <button
                  onClick={() => setPaymentFilter('unpaid')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    paymentFilter === 'unpaid' ? 'bg-rose-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  غير مدفوعة ({billingBookings.filter(b => (b.totalPrice || 0) > 0 && !(b.paidAmount || 0)).length})
                </button>
              </div>

              <div className="relative w-full sm:w-64" id="ledger-search-box">
                <input
                  type="text"
                  placeholder="ابحث عن حجز باسم الزبون أو الولاية..."
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-9 py-2 rounded-xl outline-none text-xs text-white placeholder-slate-500 text-right"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Payments ledger list */}
            {(() => {
              const filteredBookings = billingBookings
                .filter((b) => {
                  const totalPr = b.totalPrice || 0;
                  const paidAm = b.paidAmount || 0;
                  if (paymentFilter === 'paid') return totalPr > 0 && paidAm >= totalPr;
                  if (paymentFilter === 'partial') return paidAm > 0 && paidAm < totalPr;
                  if (paymentFilter === 'unpaid') return totalPr > 0 && paidAm === 0;
                  return true;
                })
                .filter((b) => {
                  if (!paymentSearch.trim()) return true;
                  const s = paymentSearch.toLowerCase();
                  return (
                    b.customerName.toLowerCase().includes(s) ||
                    b.wilaya.toLowerCase().includes(s)
                  );
                });

              return (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right text-xs" id="ledger-table">
                      <thead>
                        <tr className="bg-white/5 text-slate-400 border-b border-white/5 font-bold">
                          <th className="px-5 py-3 text-right">صاحب الحجز</th>
                          <th className="px-5 py-3 text-right">التاريخ والولاية</th>
                          <th className="px-5 py-3 text-center">البارود والكبسول المطلوب</th>
                          <th className="px-5 py-3 text-left">سعر الحجز</th>
                          <th className="px-5 py-3 text-left">المدفوع بالفعل</th>
                          <th className="px-5 py-3 text-left">المبلغ المتبقي</th>
                          <th className="px-5 py-3 text-center">حالة الدفع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-medium">
                        {filteredBookings.map((b) => {
                          const totalPr = b.totalPrice || 0;
                          const paidAm = b.paidAmount || 0;
                          const remAm = Math.max(0, totalPr - paidAm);
                          
                          let badge = (
                            <span className="bg-rose-500/10 text-rose-400 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                              <Clock size={10} />
                              <span>غير مدفوع</span>
                            </span>
                          );
                          if (totalPr > 0 && paidAm >= totalPr) {
                            badge = (
                              <span className="bg-emerald-500/10 text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 size={10} />
                                <span>مدفوع بالكامل</span>
                              </span>
                            );
                          } else if (paidAm > 0) {
                            badge = (
                              <span className="bg-amber-500/10 text-amber-300 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                                <Clock size={10} />
                                <span>مدفوع جزئياً</span>
                              </span>
                            );
                          }

                          return (
                            <tr key={b.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-5 py-4 font-bold text-white text-right">{b.customerName}</td>
                              <td className="px-5 py-4 text-right space-y-0.5">
                                <p className="text-slate-300 font-bold">{b.date}</p>
                                <p className="text-[10px] text-slate-500">{b.wilaya}</p>
                              </td>
                              <td className="px-5 py-4 text-center space-y-0.5">
                                <p className="text-amber-400 font-semibold" dir="ltr">{b.quantityKg || 0} كغ بارود</p>
                                <p className="text-[10px] text-slate-400">{b.count || 0} حبة كبسول</p>
                              </td>
                              <td className="px-5 py-4 text-left font-bold text-white font-headline" dir="ltr">
                                {totalPr.toLocaleString()} دج
                              </td>
                              <td className="px-5 py-4 text-left font-bold text-emerald-400 font-headline" dir="ltr">
                                {paidAm.toLocaleString()} دج
                              </td>
                              <td className="px-5 py-4 text-left font-bold text-amber-400 font-headline" dir="ltr">
                                {remAm.toLocaleString()} دج
                              </td>
                              <td className="px-5 py-4 text-center">
                                {badge}
                              </td>
                            </tr>
                          );
                        })}

                        {filteredBookings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                              لا توجد حجوزات نشطة لتتبع مدفوعاتها حالياً.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="block md:hidden divide-y divide-white/5" id="ledger-mobile-cards">
                    {filteredBookings.map((b) => {
                      const totalPr = b.totalPrice || 0;
                      const paidAm = b.paidAmount || 0;
                      const remAm = Math.max(0, totalPr - paidAm);
                      
                      let badge = (
                        <span className="bg-rose-500/10 text-rose-400 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                          <Clock size={10} />
                          <span>غير مدفوع</span>
                        </span>
                      );
                      if (totalPr > 0 && paidAm >= totalPr) {
                        badge = (
                          <span className="bg-emerald-500/10 text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            <span>مدفوع بالكامل</span>
                          </span>
                        );
                      } else if (paidAm > 0) {
                        badge = (
                          <span className="bg-amber-500/10 text-amber-300 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                            <Clock size={10} />
                            <span>مدفوع جزئياً</span>
                          </span>
                        );
                      }

                      return (
                        <div key={b.id} className="p-4 space-y-3 hover:bg-white/5 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-white text-sm text-right">{b.customerName}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 text-right">{b.date} • {b.wilaya}</p>
                            </div>
                            {badge}
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-white/5 p-2.5 rounded-xl text-[11px] border border-white/5 text-right">
                            <div>
                              <span className="text-slate-400 block text-right">البارود والكبسول</span>
                              <span className="text-amber-400 font-bold text-right inline-block w-full" dir="ltr">{b.quantityKg || 0} كغ / {b.count || 0} حبة</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-right">إجمالي السعر</span>
                              <span className="text-white font-bold text-right inline-block w-full" dir="ltr">{totalPr.toLocaleString()} دج</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs pt-1">
                            <div>
                              <span className="text-slate-400">المدفوع:</span>{' '}
                              <strong className="text-emerald-400 font-headline font-semibold" dir="ltr">{paidAm.toLocaleString()} دج</strong>
                            </div>
                            <div>
                              <span className="text-slate-400">المتبقي:</span>{' '}
                              <strong className="text-amber-400 font-headline font-semibold" dir="ltr">{remAm.toLocaleString()} دج</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredBookings.length === 0 && (
                      <div className="px-5 py-10 text-center text-slate-400">
                        لا توجد حجوزات نشطة لتتبع مدفوعاتها حالياً.
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Bottom Heritage badge overview row */}
      <section className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 backdrop-blur-md text-white rounded-2xl p-6 border border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg" id="heritage-footer-badge">
        <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-12 translate-y-12">
          <Scroll size={200} />
        </div>
        <div className="space-y-1 text-center md:text-right relative z-10">
          <h4 className="font-headline font-bold text-lg text-amber-400 flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles size={16} />
            <span>المرتبة الذهبية لحفظ التراث</span>
          </h4>
          <p className="text-xs text-emerald-200 opacity-90 max-w-xl leading-relaxed">
            تساهم جمعية البارود واللاعبين الجزائرية في الحفاظ على هذا الإرث اللامادي المصنف وطنيًا وعالميًا، بتنظيم عروض تعكس شجاعة وبطولة الأجداد عبر التاريخ المعاصر.
          </p>
        </div>
        <div className="bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold px-6 py-2.5 rounded-full text-xs shadow-md shrink-0 relative z-10 transition-colors">
          معتمد ومحمي قانونياً
        </div>
      </section>

    </div>
  );
}
