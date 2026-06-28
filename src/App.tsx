import { useState, useEffect, FormEvent } from 'react';
import { Booking, Rider, NavigationTab, BookingStatus, UserRole } from './types';
import { initialRiders, initialBookings, ALGERIAN_WILAYAS } from './data/seedData';
import ClientBookingView from './components/ClientBookingView';
import LoginView from './components/LoginView';
import AdminBookingsView from './components/AdminBookingsView';
import AdminRidersView from './components/AdminRidersView';
import AdminCalendarView from './components/AdminCalendarView';
import AdminStatsView from './components/AdminStatsView';
import RiderDashboardView from './components/RiderDashboardView';
import Sidebar from './components/Sidebar';
import BottomNavBar from './components/BottomNavBar';
import { LogOut, Plus, X, Menu, Calendar, Users, MapPin, Phone, UserCheck, Sparkles } from 'lucide-react';

export default function App() {
  // 1. Core Persistent State
  const [riders, setRiders] = useState<Rider[]>(() => {
    const saved = localStorage.getItem('gac_riders');
    return saved ? JSON.parse(saved) : initialRiders;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('gac_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  // 2. Navigation & Portal States
  const [activeTab, setActiveTab] = useState<NavigationTab>('bookings');
  const [showLogin, setShowLogin] = useState(false);
  const [session, setSession] = useState<{
    role: UserRole;
    username: string;
    name: string;
    riderId?: string;
  } | null>(() => {
    const saved = localStorage.getItem('gac_session');
    return saved ? JSON.parse(saved) : null;
  });

  // 3. Modals and Quick actions
  const [showQuickBookingModal, setShowQuickBookingModal] = useState(false);
  
  // Quick booking form fields
  const [qbName, setQbName] = useState('');
  const [qbPhone, setQbPhone] = useState('');
  const [qbDate, setQbDate] = useState('');
  const [qbWilaya, setQbWilaya] = useState(ALGERIAN_WILAYAS[0]);
  const [qbRidersCount, setQbRidersCount] = useState(10);
  const [qbStartPoint, setQbStartPoint] = useState('');
  const [qbEndPoint, setQbEndPoint] = useState('');

  // 4. Persistence effects
  useEffect(() => {
    localStorage.setItem('gac_riders', JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem('gac_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('gac_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('gac_session');
    }
  }, [session]);

  // 5. Database / State Operations
  const handleAddBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'assignedRiders' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking_${Date.now()}`,
      status: 'قيد الانتظار',
      assignedRiders: [],
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleUpdateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const handleAssignRiders = (bookingId: string, riderIds: string[]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, assignedRiders: riderIds } : b))
    );
  };

  const handleDeleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddRider = (riderData: Omit<Rider, 'id'>) => {
    const newRider: Rider = {
      ...riderData,
      id: `rider_${Date.now()}`,
    };
    setRiders((prev) => [...prev, newRider]);
  };

  const handleUpdateRider = (id: string, updatedData: Partial<Rider>) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r))
    );
  };

  const handleDeleteRider = (id: string) => {
    setRiders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleLoginSuccess = (userSession: typeof session) => {
    setSession(userSession);
    setShowLogin(false);
    // Redirect to bookings default on admin, or keep standard
    setActiveTab('bookings');
  };

  const handleLogout = () => {
    setSession(null);
    setShowLogin(false);
  };

  // Quick booking submit
  const handleQuickBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!qbName || !qbPhone || !qbDate || !qbStartPoint || !qbEndPoint) return;

    handleAddBooking({
      customerName: qbName,
      phone: qbPhone,
      date: qbDate,
      wilaya: qbWilaya,
      ridersCount: qbRidersCount,
      startPoint: qbStartPoint,
      endPoint: qbEndPoint,
    });

    // Reset fields
    setQbName('');
    setQbPhone('');
    setQbDate('');
    setQbWilaya(ALGERIAN_WILAYAS[0]);
    setQbRidersCount(10);
    setQbStartPoint('');
    setQbEndPoint('');
    setShowQuickBookingModal(false);
  };

  // Render Rider view if logged in as a Rider
  if (session && session.role === 'rider' && session.riderId) {
    const activeRider = riders.find((r) => r.id === session.riderId);
    if (activeRider) {
      return (
        <RiderDashboardView
          rider={activeRider}
          bookings={bookings}
          onLogout={handleLogout}
        />
      );
    }
  }

  // Render Login view if user triggered login
  if (showLogin) {
    return (
      <LoginView
        riders={riders}
        onLoginSuccess={handleLoginSuccess}
        onNavigateToClient={() => setShowLogin(false)}
      />
    );
  }

  // Render Client booking form if session is null and login is not active
  if (!session) {
    return (
      <ClientBookingView
        onAddBooking={handleAddBooking}
        onNavigateToLogin={() => setShowLogin(true)}
      />
    );
  }

  // Render Main Admin Panel (session.role === 'admin')
  return (
    <div className="min-h-screen text-right font-sans lg:mr-80 pb-32 bg-slate-950 text-slate-100 relative overflow-hidden animate-fade-in" dir="rtl">
      {/* Decorative background glows */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Panel Top Header Bar */}
      <header className="flex flex-row justify-between items-center w-full px-5 lg:px-10 h-16 z-30 bg-slate-900/40 backdrop-blur-md border-b border-white/10 sticky top-0 relative">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-white">مدير الجمعية</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span>متصل عبر لوحة التحكم</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-slate-800 overflow-hidden shrink-0">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQr_DnDfoEvvlXDUFBo-0YHL31Z6qrYy0LcR9z1oThmVqrgOJzb-hfZ23dGNxpFfqlv8AEn4bygqeBVGu8e6fg5clr9A1oojBMWUB9efVDasB9D30GiT_NdICG54dZdoufsH6OoGWXiNVt458HFxsyYxFr-i-8hvsT7saTwjyRQWBPYxNN3l-yVXtAja4p3fmYIPPW4ZIDksWW9FwUffHzZjia-eZWaGyIdqE84MR06s8EOm6ekfJN1Eyl9FoT9-d2CFoYrZRn3hM"
              alt="Manager Avatar"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white font-headline tracking-wider">GAC</h1>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 text-slate-300 hover:text-white cursor-pointer transition-colors"
          title="تسجيل الخروج"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Desktop Sidebar Navigation (Right-pinned) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
      />

      {/* Main Admin Contents Layout */}
      <main className="px-5 lg:px-10 py-8 max-w-7xl mx-auto relative z-10">
        
        {/* Active tab routing */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold font-headline text-white">إدارة حجوزات العروض</h2>
                <p className="text-xs text-slate-400 font-medium">مرحباً بك مجدداً، إليك نظرة شاملة وتفصيلية على نشاط الجمعية اليوم.</p>
              </div>
              <button
                onClick={() => setShowQuickBookingModal(true)}
                className="btn-gradient text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer font-bold text-xs border border-white/10"
              >
                <Plus size={16} />
                <span>إضافة حجز يدوي سريع</span>
              </button>
            </div>

            <AdminBookingsView
              bookings={bookings}
              riders={riders}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onAssignRiders={handleAssignRiders}
              onDeleteBooking={handleDeleteBooking}
            />
          </div>
        )}

        {activeTab === 'riders' && (
          <AdminRidersView
            riders={riders}
            onAddRider={handleAddRider}
            onUpdateRider={handleUpdateRider}
            onDeleteRider={handleDeleteRider}
          />
        )}

        {activeTab === 'calendar' && (
          <AdminCalendarView bookings={bookings} />
        )}

        {activeTab === 'stats' && (
          <AdminStatsView bookings={bookings} riders={riders} />
        )}

      </main>

      {/* Mobile Bottom Navigation Bar (Bottom-pinned) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onQuickAction={() => setShowQuickBookingModal(true)}
      />

      {/* Quick Booking Modal Dialog */}
      {showQuickBookingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickBookingSubmit}
            className="glass-panel max-w-md w-full p-6 border border-white/15 animate-scale-up text-right space-y-4"
            dir="rtl"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-headline text-white flex items-center gap-1.5">
                <Sparkles size={18} className="text-indigo-400 animate-pulse" />
                <span>إضافة حجز يدوي سريع</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickBookingModal(false)}
                className="p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">اسم الزبون / الهيئة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: السيد رشيد بن باديس"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={qbName}
                  onChange={(e) => setQbName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    placeholder="05XXXXXXXX"
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                    value={qbPhone}
                    onChange={(e) => setQbPhone(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">تاريخ العرض</label>
                  <input
                    type="date"
                    required
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-xl outline-none text-xs font-medium text-white"
                    value={qbDate}
                    onChange={(e) => setQbDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">الولاية المعنية</label>
                  <select
                    className="bg-slate-900 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-xl outline-none text-xs font-medium text-white"
                    value={qbWilaya}
                    onChange={(e) => setQbWilaya(e.target.value)}
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w} value={w} className="bg-slate-900 text-white">
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">عدد الفرسان المطلوب</label>
                  <input
                    type="number"
                    min="5"
                    required
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-xl outline-none text-xs text-white"
                    value={qbRidersCount}
                    onChange={(e) => setQbRidersCount(parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">نقطة الانطلاق بالتفصيل</label>
                <input
                  type="text"
                  required
                  placeholder="مكان تجمع الخيالة الأساسي"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={qbStartPoint}
                  onChange={(e) => setQbStartPoint(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">مكان العرض النهائي</label>
                <input
                  type="text"
                  required
                  placeholder="ساحة الاحتفال أو الملعب"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={qbEndPoint}
                  onChange={(e) => setQbEndPoint(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowQuickBookingModal(false)}
                className="px-5 py-2 border border-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-full hover:bg-white/5 cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 btn-gradient text-white font-bold text-xs rounded-full hover:opacity-95 transition-opacity cursor-pointer border border-white/10"
              >
                تأكيد وتسجيل الحجز
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
