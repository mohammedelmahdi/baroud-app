import React, { useState } from 'react';
import { Booking } from '../types';
import { ALGERIAN_WILAYAS } from '../data/seedData';
import { Users, Award, ShieldCheck, Scroll, Send, CheckCircle, LogIn, Calendar, MapPin, Phone, User as UserIcon } from 'lucide-react';

interface ClientBookingViewProps {
  onAddBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'assignedRiders' | 'createdAt'>) => void;
  onNavigateToLogin: () => void;
  appName?: string;
}

export default function ClientBookingView({ onAddBooking, onNavigateToLogin, appName = 'GAC' }: ClientBookingViewProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [wilaya, setWilaya] = useState(ALGERIAN_WILAYAS[0]);
  const [ridersCount, setRidersCount] = useState(5);
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date || !startPoint || !endPoint) return;

    setSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onAddBooking({
        customerName: name,
        phone,
        date,
        wilaya,
        ridersCount,
        startPoint,
        endPoint,
      });
      setSubmitting(false);
      setSubmitted(true);
      // Reset form
      setName('');
      setPhone('');
      setDate('');
      setWilaya(ALGERIAN_WILAYAS[0]);
      setRidersCount(5);
      setStartPoint('');
      setEndPoint('');
    }, 1200);
  };

  return (
    <div className="min-h-screen pb-24 text-right bg-slate-950 text-slate-100 relative overflow-hidden" dir="rtl">
      {/* Background Decorative Cosmic Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="flex flex-row justify-between items-center w-full px-5 md:px-10 h-16 z-50 bg-slate-900/40 backdrop-blur-md border-b border-white/10 sticky top-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white font-headline tracking-wider">{appName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateToLogin}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full text-sm transition-colors border border-white/10 cursor-pointer"
          >
            <LogIn size={16} className="text-indigo-400" />
            <span>بوابة الإدارة والخيالة</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-10 py-8 relative z-10">
        {/* Hero Section: Modern Heritage */}
        <section className="relative w-full h-[320px] md:h-[480px] rounded-2xl overflow-hidden mb-12 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 animate-fade-in">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuABav-airnYXHDgCQ6ap4k_cgR-5lOCKTc9ad9pxoToszJCtv9RcSGFGuPi5Ny8Np0VjX2jrBfphT2IR3_Efikhvdd90xG1rGAUxLC3k3rKRXtMBHB4ZTDMP7whIGvhf7ogpdpZlVxbVz_hMEnN57BUvGxspGGpZjTfP8ez1Iu1sVwdgOcA5NAyldeVZ_AU0nWKS7SBdG7MO1YPUsXQImaNbyJfyzSRdKAYDV21lEGeu7uxEhVWB51mVQqkFxYYylq4f1NLGA4ONpM')`,
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-10 text-white">
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-3 leading-tight text-white">
              أصالة البارود في حلتها الجديدة
            </h2>
            <p className="text-sm md:text-lg max-w-2xl text-slate-300 leading-relaxed font-sans">
              نحن نربط بين التقاليد والاحترافية لتنظيم عروض الفانتازيا والخيالة بأعلى المعايير التنظيمية والإدارية لتخليد تراثنا العريق.
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Information Panel (Asymmetric Content) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6 md:p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white font-headline mb-6 border-b border-white/10 pb-3">
                كيفية الحجز والتنسيق
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="bg-indigo-500/10 text-indigo-300 w-9 h-9 rounded-full flex items-center justify-center font-bold font-headline shrink-0 border border-indigo-500/20">
                    ١
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">املأ بيانات الطلب بدقة</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      أدخل تفاصيل الفعالية، التاريخ المرغوب فيه، ومكان العرض بدقة لمساعدتنا على التخطيط بشكل أفضل.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="bg-indigo-500/10 text-indigo-300 w-9 h-9 rounded-full flex items-center justify-center font-bold font-headline shrink-0 border border-indigo-500/20">
                    ٢
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">تأكيد الموعد والتفاصيل</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      احجز طلبك الآن وسيقوم مدير الجمعية بالاتصال بك لمراجعة تفاصيل العرض والتأكيد في غضون ٢٤ ساعة.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="bg-indigo-500/10 text-indigo-300 w-9 h-9 rounded-full flex items-center justify-center font-bold font-headline shrink-0 border border-indigo-500/20">
                    ٣
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">تنفيذ العرض الفني الأصيل</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      سيحضر فريق الخيالة والبارود المعتمد في المكان المحدد لتقديم لوحة تراثية مهيبة تأسر القلوب وتشرّف مناسبتكم.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="hidden lg:block relative rounded-2xl overflow-hidden h-64 border border-white/10 group shadow-lg">
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8b9EHCsV--1E5tuHBjb-4qrqIsIQo4R9CqTYau0lWaz9CKnpqeRElizMpv3rUyzmWdDwi19pQA67unKo2ZByXJary8waKqTSB4WgPIQovioDiTA_nA-YT47ZDmlK51Umq7TfNs9SDsX4gipMSDCo0n2mHUVzmrMCGxIfC4Ndn6OyN5KCCok17Ttu0wn8Yc6H2l5F5t4-sYN-erQ3ppQoUbhsoSWPZiwJHnJccz4d6anwwUDpSF2JBbXKcfs5RKPhrVkABqNpNBsA"
                alt="Algerian Horse Saddle detail"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-semibold tracking-wider font-headline">جودة وفخامة الإكسسوارات والعتاد التقليدي</span>
              </div>
            </div>
          </div>

          {/* Booking Form Card */}
          <div className="lg:col-span-7 glass-card p-6 md:p-10 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
            
            <h3 className="text-2xl font-bold font-headline text-white mb-2">طلب حجز عرض بارود / فانتازيا</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">أدخل المعلومات التالية لبدء عملية التنسيق وسنتواصل معك فوراً</p>
            
            {submitted ? (
              <div className="text-center p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl my-6 animate-scale-up">
                <div className="flex flex-col items-center justify-center text-emerald-300 font-bold gap-3">
                  <CheckCircle size={48} className="text-emerald-400 animate-bounce" />
                  <span className="text-xl font-headline">تم إرسال طلبك بنجاح!</span>
                </div>
                <p className="text-sm text-emerald-400 mt-2">
                  لقد سجلنا تفاصيل الحجز، وسيتواصل معك مدير الجمعية في أقرب وقت لتنسيق الخيالة وتأكيد العرض.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 btn-gradient text-white font-bold text-sm rounded-full cursor-pointer border border-white/10"
                >
                  تقديم طلب حجز آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <UserIcon size={14} className="text-indigo-400" />
                      الاسم الكامل للزبون
                    </label>
                    <input
                      type="text"
                      className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl transition-all outline-none text-sm text-white"
                      placeholder="محمد الجزائري"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Phone size={14} className="text-indigo-400" />
                      رقم الهاتف للتواصل
                    </label>
                    <input
                      type="tel"
                      className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl transition-all outline-none text-sm text-white"
                      placeholder="05XXXXXXXX"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Event Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Calendar size={14} className="text-indigo-400" />
                      تاريخ الفعالية
                    </label>
                    <input
                      type="date"
                      className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl transition-all outline-none text-sm text-white"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  {/* Wilaya State */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <MapPin size={14} className="text-indigo-400" />
                      الولاية
                    </label>
                    <select
                      className="bg-slate-900 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl transition-all outline-none text-sm font-medium text-white"
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                    >
                      {ALGERIAN_WILAYAS.map((w) => (
                        <option key={w} value={w} className="bg-slate-900 text-white">
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Performers */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Users size={14} className="text-indigo-400" />
                      عدد الخيالة المطلوب
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl transition-all outline-none text-sm text-white"
                      placeholder="أقل عدد هو ٥ خيالة"
                      required
                      value={ridersCount}
                      onChange={(e) => setRidersCount(parseInt(e.target.value) || 5)}
                    />
                  </div>

                  {/* Empty spacer for desktop */}
                  <div className="hidden md:block" />

                  {/* Location Details */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">نقطة الانطلاق (المكان المحدد لبداية العرض)</label>
                    <input
                      type="text"
                      className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl transition-all outline-none text-sm text-white"
                      placeholder="العنوان بالتفصيل، بلدية...، نقطة التجمع"
                      required
                      value={startPoint}
                      onChange={(e) => setStartPoint(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">نقطة النهاية / مكان تجمع العرض والاحتفال</label>
                    <input
                      type="text"
                      className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl transition-all outline-none text-sm text-white"
                      placeholder="مكان وصول الخيالة والبارود النهائي"
                      required
                      value={endPoint}
                      onChange={(e) => setEndPoint(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-gradient text-white font-bold text-base py-4 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 cursor-pointer border border-white/10"
                >
                  {submitting ? 'جاري تسجيل حجزك...' : 'إرسال طلب الحجز التراثي'}
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Stats / Trust Section */}
        <section className="mt-20 mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 text-center border border-white/10 hover:-translate-y-1 transition-transform">
            <span className="text-indigo-400 text-3xl mb-2 flex justify-center"><Users size={32} /></span>
            <p className="text-2xl font-bold text-white font-headline">+١٥٠</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">خيال وبارودي محترف</p>
          </div>
          
          <div className="glass-card p-6 text-center border border-white/10 hover:-translate-y-1 transition-transform">
            <span className="text-indigo-400 text-3xl mb-2 flex justify-center"><Award size={32} /></span>
            <p className="text-2xl font-bold text-white font-headline">١٠٠٪</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">أصالة وجودة تنظيمية</p>
          </div>
          
          <div className="glass-card p-6 text-center border border-white/10 hover:-translate-y-1 transition-transform">
            <span className="text-indigo-400 text-3xl mb-2 flex justify-center"><ShieldCheck size={32} /></span>
            <p className="text-2xl font-bold text-white font-headline">معتمد رسميًا</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">من وزارة الثقافة والفنون</p>
          </div>
          
          <div className="glass-card p-6 text-center border border-white/10 hover:-translate-y-1 transition-transform">
            <span className="text-indigo-400 text-3xl mb-2 flex justify-center"><Scroll size={32} /></span>
            <p className="text-2xl font-bold text-white font-headline">تراث وطني</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">موثق ومحمي عبر الأجيال</p>
          </div>
        </section>
      </main>
    </div>
  );
}
