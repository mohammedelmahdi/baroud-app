import React, { useState, useEffect } from 'react';
import { Booking, Rider } from '../types';
import { X, Printer, Edit, Eye, FileText, Info, ExternalLink } from 'lucide-react';

interface PrintMissionOrderProps {
  booking: Booking;
  riders: Rider[];
  onClose: () => void;
}

export default function PrintMissionOrder({ booking, riders, onClose }: PrintMissionOrderProps) {
  // Detect if running inside an iframe (like the AI Studio preview pane)
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }
  }, []);

  // Get assigned riders details
  const assignedRidersList = riders.filter((r) => booking.assignedRiders.includes(r.id));
  const primaryRider = assignedRidersList[0];
  const otherRiders = assignedRidersList.slice(1);

  // Editable Form States
  const [mrName, setMrName] = useState(primaryRider ? primaryRider.name : '........................................');
  const [position, setPosition] = useState(
    primaryRider 
      ? `${primaryRider.type === 'خيال' ? 'خيّال' : 'بارودي'} / عضو الجمعية` 
      : 'عضو الجمعية'
  );
  const [fromPlace, setFromPlace] = useState(booking.startPoint || 'باتنة');
  const [toPlace, setToPlace] = useState(`${booking.endPoint} (ولاية ${booking.wilaya})`);
  const [withRiders, setWithRiders] = useState(
    otherRiders.length > 0 
      ? otherRiders.map((r) => r.name).join('، ')
      : '........................................'
  );
  const [reason, setReason] = useState('المشاركة في ألعاب الفروسية والبارود التقليدي وفنون الفنتازيا');
  const [startDate, setStartDate] = useState(booking.date);
  const [endDate, setEndDate] = useState(booking.date);
  const [duration, setDuration] = useState('يوم واحد');
  const [transportMethod, setTransportMethod] = useState('سيارة خاصة');
  const [plateNumber, setPlateNumber] = useState('');
  const [issuedAt, setIssuedAt] = useState('باتنة');
  
  // Format today's date in Arabic (e.g. 10 جويلية 2026)
  const getArabicTodayDate = () => {
    const today = new Date();
    const months = [
      'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
      'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };
  
  const [issuedDate, setIssuedDate] = useState(getArabicTodayDate());

  // 15 Numbered lines for "المعنيون بالمهمة" on the left
  const [missionMembers, setMissionMembers] = useState<string[]>(() => {
    const lines = Array(15).fill('');
    assignedRidersList.forEach((rider, idx) => {
      if (idx < 15) {
        lines[idx] = `${rider.name} (${rider.type === 'خيال' ? 'خيّال' : 'بارود'})`;
      }
    });
    return lines;
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const updateMemberLine = (index: number, val: string) => {
    const updated = [...missionMembers];
    updated[index] = val;
    setMissionMembers(updated);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-start p-0 sm:p-4 overflow-y-auto" dir="rtl">
      {/* Dynamic styles injected specifically for this component to control printing layout perfectly */}
      <style>{`
        @media print {
          /* Hide everything except the print-area-root */
          body * {
            visibility: hidden;
            background-color: white !important;
            color: black !important;
          }
          .print-area-root, .print-area-root * {
            visibility: visible;
          }
          .print-area-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="bg-slate-900 border border-white/10 w-full max-w-6xl rounded-none sm:rounded-2xl shadow-2xl flex flex-col h-screen sm:h-[calc(100vh-2rem)] my-auto overflow-hidden no-print">
        {/* Top Header */}
        <div className="flex justify-between items-center bg-slate-950 p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FileText className="text-emerald-400" size={24} />
            <div>
              <h2 className="text-white font-bold text-sm sm:text-base font-headline">
                أمر القيام بمهمة - حجز {booking.customerName}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400">
                مستند رسمي معبأ وجاهز للطباعة المباشرة من قبل الإدارة
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Print Button (Header) */}
            <button
              onClick={handlePrint}
              disabled={isIframe}
              className={`px-4 py-2 text-white font-bold text-xs rounded-full flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg ${
                isIframe 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95'
              }`}
            >
              <Printer size={14} />
              <span>طباعة المستند</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Warning banner if inside iframe */}
        {isIframe && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 px-4 flex gap-3 items-center text-xs text-amber-200">
            <Info size={18} className="shrink-0 text-amber-400 animate-pulse" />
            <div className="flex-1 leading-relaxed">
              <strong>تنبيه الأمان للمتصفح:</strong> أنت تقوم بمعاينة التطبيق داخل إطار مصغر (Iframe)، وهو ما يمنع المتصفح من فتح نافذة الطباعة مباشرة. يرجى الضغط على زر <strong className="text-amber-400 underline inline-flex items-center gap-1">افتح في نافذة جديدة <ExternalLink size={12} /></strong> الموجود في أعلى يسار شاشة AI Studio لفتح التطبيق بشكل كامل، ومن ثم ستعمل الطباعة بنجاح بنسبة 100%!
            </div>
          </div>
        )}

        {/* Tab Selector on Mobile */}
        <div className="flex border-b border-white/10 bg-slate-950/50 sm:hidden">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 ${
              activeTab === 'edit' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Edit size={14} />
            <span>تعديل المعلومات</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 ${
              activeTab === 'preview' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Eye size={14} />
            <span>معاينة الصفحة</span>
          </button>
        </div>

        {/* Dual Layout Panel */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Form Editor Panel (Right side on desktop) */}
          <div className={`w-full sm:w-1/2 p-4 sm:p-6 overflow-y-auto border-l border-white/10 space-y-4 ${
            activeTab === 'edit' ? 'block' : 'hidden sm:block'
          }`}>
            <h3 className="text-white font-bold text-sm border-b border-white/5 pb-2 flex items-center gap-1.5 text-emerald-400">
              <Edit size={14} />
              <span>تعديل بيانات مستند أمر المهمة</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-right">
              {/* MR Name */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-bold text-slate-300">السيد (المكلف الأساسي بالمهمة)</label>
                <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={mrName}
                  onChange={(e) => setMrName(e.target.value)}
                />
              </div>

              {/* Position */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">المنصب</label>
                <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>

              {/* Transportation Plate */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">لوحة ترقيم المركبة</label>
                <input
                  type="text"
                  placeholder="مثال: 00123-116-05"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                />
              </div>

              {/* From Point */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">مأمور بالذهاب من</label>
                <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={fromPlace}
                  onChange={(e) => setFromPlace(e.target.value)}
                />
              </div>

              {/* To Point */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">إلى</label>
                <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={toPlace}
                  onChange={(e) => setToPlace(e.target.value)}
                />
              </div>

              {/* With Riders */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-bold text-slate-300">صحبة المعنيين بالمهمة (مرافقون)</label>
                <textarea
                  rows={2}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm resize-none"
                  value={withRiders}
                  onChange={(e) => setWithRiders(e.target.value)}
                />
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-bold text-slate-300">سبب التنقل</label>
                <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">تاريخ القيام بالمهمة</label>
                <input
                  type="date"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm text-left"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">تاريخ انتهاء المهمة</label>
                <input
                  type="date"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm text-left"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Duration & Transportation Method */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">المدة المحددة</label>
                <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">طريقة ووسيلة النقل</label>
                <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={transportMethod}
                  onChange={(e) => setTransportMethod(e.target.value)}
                />
              </div>

              {/* Release Place and Release Date */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">حرر بـ</label>
                <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={issuedAt}
                  onChange={(e) => setIssuedAt(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">يوم</label>
                <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                />
              </div>
            </div>

            {/* List of 15 members editing section */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <label className="font-bold text-xs text-emerald-400 block">المعنيون بالمهمة (العمود الأيمن من الصفحة - حتى 15 فرداً)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-44 overflow-y-auto bg-slate-950/50 p-2.5 rounded-xl border border-white/5 custom-scrollbar">
                {missionMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 shrink-0 w-5">{(index + 1).toString().padStart(2, '0')}-</span>
                    <input
                      type="text"
                      placeholder={`مهمة فارغة...`}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-200 text-xs outline-none focus:border-emerald-500"
                      value={member}
                      onChange={(e) => updateMemberLine(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document Print Preview Panel (Left side on desktop, toggled on mobile) */}
          <div className={`w-full sm:w-1/2 p-4 sm:p-6 bg-slate-950 overflow-y-auto flex justify-center ${
            activeTab === 'preview' ? 'block' : 'hidden sm:block'
          }`}>
            {/* The Print Sheet container mimic A4 */}
            <div className="bg-white text-black w-full max-w-[21cm] min-h-[29.7cm] p-[1.5cm] flex flex-col justify-between shadow-2xl relative select-none print-area-root font-sans" style={{ direction: 'rtl' }}>
              
              {/* Algerian Stripes sash (top right decoration matching PDF) */}
              <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none">
                <div className="absolute top-4 -right-12 w-64 h-3.5 bg-emerald-600 rotate-45 transform"></div>
                <div className="absolute top-8 -right-10 w-64 h-3.5 bg-red-600 rotate-45 transform"></div>
                <div className="absolute top-12 -right-8 w-64 h-3.5 bg-emerald-600 rotate-45 transform"></div>
              </div>

              {/* Page Content */}
              <div className="flex-1 flex flex-col">
                
                {/* Official Header */}
                <div className="flex justify-between items-start text-[11px] font-bold leading-relaxed border-b border-black/10 pb-4 mb-4">
                  {/* Right Header Text */}
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold tracking-wide mb-1">الجمهوريــــة الجزائريــــة الديمقراطيــــة الشعبيـــــــــة</p>
                    <p className="font-semibold text-[11px]">واليــــــة باتنــــــــة</p>
                    <p className="font-semibold text-[11px]">مديريــة التنظـــيم و الشؤون العامـــــــــة</p>
                    <p className="font-semibold text-[11px]">مصلحة التنظــــــــــيم العـــــام</p>
                    <p className="font-extrabold text-indigo-900 border-r-2 border-emerald-600 pr-1.5 mt-1 text-xs">جمعية أولاد سلطان للخيالة والبارود التقليدي – باتنة –</p>
                    <p className="text-[9px] text-gray-600">المقر الإداري طريق حملة حي كشــــيد ة - باتن ة</p>
                    <p className="text-[9px] text-gray-600">الم طابقـــة القــــانونية مع القانون 06/12</p>
                  </div>

                  {/* Left Place / Date */}
                  <div className="text-left font-semibold shrink-0 pt-6 text-xs pl-2">
                    <p>باتنة في: <span className="font-bold border-b border-dashed border-gray-400 px-2">{issuedDate}</span></p>
                  </div>
                </div>

                {/* Doc Title */}
                <div className="text-center my-6">
                  <h1 className="text-2xl font-black tracking-widest border-2 border-black inline-block px-10 py-2 rounded shadow-[2px_2px_0_#000]">
                    أمـــر للقيـــــــــــام بمهمـــــــــــــــــة
                  </h1>
                </div>

                {/* Main Body Columns */}
                <div className="flex flex-row gap-6 mt-4 items-stretch flex-1">
                  
                  {/* Right Column (تفاصيل المهمة) */}
                  <div className="w-[62%] flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-4 text-xs font-medium">
                      
                      {/* السيد */}
                      <div className="flex items-end gap-2">
                        <span className="font-extrabold shrink-0">السيد:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-bold text-sm min-h-[1.5em] pb-0.5">
                          {mrName}
                        </span>
                      </div>

                      {/* المنصب */}
                      <div className="flex items-end gap-2">
                        <span className="font-extrabold shrink-0">المنصب:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-semibold min-h-[1.5em] pb-0.5">
                          {position}
                        </span>
                      </div>

                      {/* مأمور بالذهاب من */}
                      <div className="flex items-end gap-2">
                        <span className="font-extrabold shrink-0">مأ مور بالذهاب من:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-semibold min-h-[1.5em] pb-0.5">
                          {fromPlace}
                        </span>
                      </div>

                      {/* إلى */}
                      <div className="flex items-end gap-2">
                        <span className="font-extrabold shrink-0">إلى:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-semibold min-h-[1.5em] pb-0.5">
                          {toPlace}
                        </span>
                      </div>

                      {/* صحبة المعنيين بالمهمة */}
                      <div className="flex items-end gap-2">
                        <span className="font-extrabold shrink-0">صحبة المعنيين بالمهمة:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-semibold min-h-[1.5em] pb-0.5 leading-relaxed">
                          {withRiders}
                        </span>
                      </div>

                      {/* سبب التنقل */}
                      <div className="flex items-end gap-2">
                        <span className="font-extrabold shrink-0">سبب التنقل:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-semibold min-h-[1.5em] pb-0.5 leading-relaxed">
                          {reason}
                        </span>
                      </div>

                      {/* تاريخ القيام */}
                      <div className="flex items-end gap-2">
                        <span className="font-extrabold shrink-0">تاريخ القيام بالمهمة:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-semibold min-h-[1.5em] pb-0.5">
                          {startDate}
                        </span>
                      </div>

                      {/* تاريخ الانتهاء */}
                      <div className="flex items-end gap-2">
                        <span className="font-extrabold shrink-0">تاريخ انتهاء المهمة:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-semibold min-h-[1.5em] pb-0.5">
                          {endDate}
                        </span>
                      </div>

                      {/* المدة المحددة */}
                      <div className="flex items-end gap-2">
                        <span className="font-extrabold shrink-0">المدة المحددة:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-semibold min-h-[1.5em] pb-0.5">
                          {duration}
                        </span>
                      </div>

                      {/* طريقة ووسيلة النقل */}
                      <div className="flex flex-col gap-2.5 pt-1">
                        <div className="flex items-end gap-2">
                          <span className="font-extrabold shrink-0">طريقة و وسيلة النقل:</span>
                          <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-semibold min-h-[1.5em] pb-0.5">
                            {transportMethod}
                          </span>
                        </div>
                        
                        {/* سيارة خاصة indicator block */}
                        <div className="flex items-center gap-6 pr-6">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border border-black rounded-sm flex items-center justify-center bg-gray-100 font-bold text-[10px]">
                              {transportMethod.includes('سيارة خاصة') ? '✓' : ''}
                            </span>
                            <span className="font-extrabold text-xs">سيــــــارة خاصـــــــــة</span>
                          </div>
                        </div>
                      </div>

                      {/* لوحة ترقيم المركبة */}
                      <div className="flex items-end gap-2 pt-1">
                        <span className="font-extrabold shrink-0">لوحة ترقيم المركبة:</span>
                        <span className="border-b border-dotted border-gray-500 flex-1 px-2 font-bold min-h-[1.5em] pb-0.5">
                          {plateNumber || '........................................'}
                        </span>
                      </div>

                      {/* حرر بـ / يوم */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-end gap-1.5">
                          <span className="font-extrabold shrink-0">حرر بـ:</span>
                          <span className="border-b border-dotted border-gray-500 flex-1 px-1 font-semibold min-h-[1.5em] pb-0.5">
                            {issuedAt}
                          </span>
                        </div>
                        <div className="flex items-end gap-1.5">
                          <span className="font-extrabold shrink-0">يوم:</span>
                          <span className="border-b border-dotted border-gray-500 flex-1 px-1 font-semibold min-h-[1.5em] pb-0.5">
                            {issuedDate}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Signature block */}
                    <div className="text-left pl-12 pt-6">
                      <p className="font-black text-sm">توقيــــع الرئيـــــس</p>
                      <div className="h-16 w-32 border border-transparent"></div> {/* Space for stamp/signature */}
                    </div>

                  </div>

                  {/* Left Column (المعنيون بالمهمة) */}
                  <div className="w-[38%] border-r border-gray-300 pr-4 flex flex-col">
                    <h4 className="text-center font-black text-xs bg-gray-100 py-1.5 border border-gray-300 mb-3 rounded">
                      المعنيون بالمهمة
                    </h4>
                    <div className="space-y-1.5 flex-1 flex flex-col justify-between text-xs pb-4">
                      {missionMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-dotted border-gray-400 pb-0.5 min-h-[1.8em]">
                          {/* Name content on left */}
                          <span className="font-semibold text-right flex-1 overflow-hidden whitespace-nowrap text-ellipsis px-1 text-[11px]">
                            {member || ' '}
                          </span>
                          {/* Number is aligned to the right inside the row as per the PDF image */}
                          <span className="font-bold text-gray-700 text-xs shrink-0 pl-1">
                            -{String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Bottom Official Notice Note */}
                <div className="border-t-2 border-black/10 pt-4 mt-6">
                  <p className="text-[10px] font-black leading-relaxed">
                    <span className="underline ml-1">مالحظــــــــــــــــة:</span>
                    على السلطات المدنية والعسكرية أن تسمح لحامل هذا الأمر بالمهمة بالمرور بكل حرية وتسهل عليه القيام بمهمته مع إعطائه يد المساعدة.
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Bottom Actions footer */}
        <div className="bg-slate-950 p-4 border-t border-white/10 flex justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-white/10 text-slate-300 font-bold text-xs rounded-full hover:bg-white/5 cursor-pointer transition-colors"
          >
            إغلاق المعاينة
          </button>
          
          <button
            onClick={handlePrint}
            disabled={isIframe}
            className={`px-6 py-2 font-bold text-xs rounded-full flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg ${
              isIframe 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-95'
            }`}
          >
            <Printer size={14} />
            <span>طباعة الآن (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
