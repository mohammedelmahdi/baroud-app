import React, { useState } from 'react';
import { Booking, Rider, AppNotification } from '../types';
import { Calendar, MapPin, User, PhoneCall, Sparkles, LogOut, Plus, X, Send, CheckCircle, Edit, Search, Check, UserPlus, Edit2 } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { ALGERIAN_WILAYAS } from '../data/seedData';

interface RiderDashboardViewProps {
  rider: Rider;
  bookings: Booking[];
  riders: Rider[];
  onLogout: () => void;
  appName?: string;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onAddBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'assignedRiders' | 'createdAt'> & { assignedRiders?: string[] }) => void;
  onUpdateBooking: (id: string, updatedData: Partial<Booking>) => Promise<void>;
}

export default function RiderDashboardView({
  rider,
  bookings,
  riders,
  onLogout,
  appName = 'GAC',
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onAddBooking,
  onUpdateBooking,
}: RiderDashboardViewProps) {
  // Get assignments dynamically
  const assignedBookings = bookings.filter((b) => b.assignedRiders.includes(rider.id) || b.createdBy === `اللاعب: ${rider.name}`);

  // Helper to check if a rider is busy on a given date (has a booking on that date)
  const isRiderBusyOnDate = (riderId: string, dateStr: string, currentBookingId?: string) => {
    if (!dateStr) return false;
    return bookings.some((b) => {
      // Ignore the current booking being edited
      if (currentBookingId && b.id === currentBookingId) return false;
      return b.date === dateStr && b.assignedRiders.includes(riderId) && b.status !== 'ملغى';
    });
  };

  // State for Quick Booking
  const [showQuickBookingModal, setShowQuickBookingModal] = useState(false);
  const [qbName, setQbName] = useState('');
  const [qbPhone, setQbPhone] = useState('');
  const [qbPhoneError, setQbPhoneError] = useState('');
  const [qbDate, setQbDate] = useState('');
  const [qbWilaya, setQbWilaya] = useState(ALGERIAN_WILAYAS[0]);
  const [qbRidersCount, setQbRidersCount] = useState(2);
  const [qbStartPoint, setQbStartPoint] = useState('');
  const [qbEndPoint, setQbEndPoint] = useState('');
  const [qbQuantityKg, setQbQuantityKg] = useState<number | ''>('');
  const [qbCount, setQbCount] = useState<number | ''>('');
  const [qbAssignedRiders, setQbAssignedRiders] = useState<string[]>([rider.id]);
  const [qbRiderSearchQuery, setQbRiderSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleQuickBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQbPhoneError('');
    if (!qbName || !qbPhone || !qbDate || !qbStartPoint || !qbEndPoint) return;

    // Validate phone number (Algerian mobile format: 05, 06, or 07 followed by 8 digits, or international version +213...)
    const cleanPhone = qbPhone.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^(05|06|07)\d{8}$/;
    const internationalRegex = /^\+213(5|6|7)\d{8}$/;
    
    if (!phoneRegex.test(cleanPhone) && !internationalRegex.test(cleanPhone)) {
      setQbPhoneError('الرجاء إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام (أو صيغة +213)');
      return;
    }

    if (qbRidersCount < 2) {
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      onAddBooking({
        customerName: qbName,
        phone: cleanPhone,
        date: qbDate,
        wilaya: qbWilaya,
        ridersCount: qbRidersCount,
        startPoint: qbStartPoint,
        endPoint: qbEndPoint,
        createdBy: `اللاعب: ${rider.name}`,
        assignedRiders: qbAssignedRiders,
        quantityKg: qbQuantityKg !== '' ? Number(qbQuantityKg) : undefined,
        count: qbCount !== '' ? Number(qbCount) : undefined,
      });

      // Reset fields
      setQbName('');
      setQbPhone('');
      setQbDate('');
      setQbWilaya(ALGERIAN_WILAYAS[0]);
      setQbRidersCount(2);
      setQbStartPoint('');
      setQbEndPoint('');
      setQbQuantityKg('');
      setQbCount('');
      setQbPhoneError('');
      setQbAssignedRiders([rider.id]);
      setSubmitting(false);
      setShowQuickBookingModal(false);
    }, 1000);
  };

  // State for Editing Booking
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<Booking | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPhoneError, setEditPhoneError] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editWilaya, setEditWilaya] = useState(ALGERIAN_WILAYAS[0]);
  const [editRidersCount, setEditRidersCount] = useState(2);
  const [editStartPoint, setEditStartPoint] = useState('');
  const [editEndPoint, setEditEndPoint] = useState('');
  const [editAssignedRiders, setEditAssignedRiders] = useState<string[]>([]);
  const [editRiderSearchQuery, setEditRiderSearchQuery] = useState('');
  const [updating, setUpdating] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  // State for Assigning Riders (similar to Admin)
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [selectedRiderIds, setSelectedRiderIds] = useState<string[]>([]);
  const [assignRiderSearchQuery, setAssignRiderSearchQuery] = useState('');

  // Open rider assignment modal
  const openAssignModal = (booking: Booking) => {
    setAssigningBooking(booking);
    setSelectedRiderIds([...(booking.assignedRiders || [])]);
    setAssignRiderSearchQuery('');
  };

  // Handle rider checkbox toggle
  const handleRiderToggle = (riderId: string) => {
    if (selectedRiderIds.includes(riderId)) {
      setSelectedRiderIds(selectedRiderIds.filter((id) => id !== riderId));
    } else {
      const targetRider = riders.find((r) => r.id === riderId);
      const isBusy = (targetRider?.status === 'في مهمة') || isRiderBusyOnDate(riderId, assigningBooking?.date || '', assigningBooking?.id);
      if (isBusy) {
        return;
      }
      setSelectedRiderIds([...selectedRiderIds, riderId]);
    }
  };

  // Save rider assignment
  const saveAssignments = async () => {
    if (assigningBooking) {
      const updatedFields: Partial<Booking> = {
        assignedRiders: selectedRiderIds,
      };
      
      // Auto upgrade status to Confirmed if it was Pending and riders are assigned
      if (assigningBooking.status === 'قيد الانتظار' && selectedRiderIds.length > 0) {
        updatedFields.status = 'مؤكد';
      }

      await onUpdateBooking(assigningBooking.id, updatedFields);
      setAssigningBooking(null);
    }
  };

  const handleEditBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditPhoneError('');
    if (!selectedBookingForEdit || !editName || !editPhone || !editDate || !editStartPoint || !editEndPoint) return;

    // Validate phone number (Algerian mobile format: 05, 06, or 07 followed by 8 digits, or international version +213...)
    const cleanPhone = editPhone.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^(05|06|07)\d{8}$/;
    const internationalRegex = /^\+213(5|6|7)\d{8}$/;
    
    if (!phoneRegex.test(cleanPhone) && !internationalRegex.test(cleanPhone)) {
      setEditPhoneError('الرجاء إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام (أو صيغة +213)');
      return;
    }

    if (editRidersCount < 2) {
      return;
    }

    setUpdating(true);
    try {
      await onUpdateBooking(selectedBookingForEdit.id, {
        customerName: editName,
        phone: cleanPhone,
        date: editDate,
        wilaya: editWilaya,
        ridersCount: editRidersCount,
        startPoint: editStartPoint,
        endPoint: editEndPoint,
        assignedRiders: editAssignedRiders,
      });
      setShowEditBookingModal(false);
      setSelectedBookingForEdit(null);
      setEditPhoneError('');
    } catch (err) {
      console.error('Error updating booking:', err);
    } finally {
      setUpdating(false);
    }
  };

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
            <p className="text-slate-400 text-[10px] mt-1 font-medium">اللاعب المعتمد</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white font-headline tracking-wider">{appName}</h1>

        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            onMarkAsRead={onMarkNotificationRead}
            onClear={onClearNotifications}
            currentUserRole="rider"
            currentRiderId={rider.id}
          />
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-9 h-9 rounded-full text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer border border-red-500/20"
            title="تسجيل الخروج"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 md:px-10 pt-8 space-y-6 relative z-10">
        
        {/* Header Title Section with Quick Booking */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white font-headline mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" />
              <span>العروض والأعراس المكلف بها</span>
            </h2>
            <div className="h-1 w-20 bg-indigo-500 rounded-full" />
          </div>
          <button
            onClick={() => {
              setQbRiderSearchQuery('');
              setShowQuickBookingModal(true);
            }}
            className="btn-gradient text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer font-bold text-xs border border-white/10"
          >
            <Plus size={16} />
            <span>حجز سريع جديد</span>
          </button>
        </header>

        {/* Wedding / Bookings List Grid */}
        <div className="grid grid-cols-1 gap-4">
          {assignedBookings.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10 text-slate-400 font-semibold text-sm">
              لا توجد عروض أو أعراس مكلف بها حاليًا. متاح دائمًا للاستدعاء!
            </div>
          ) : (
            assignedBookings.map((booking) => {
              const isPending = booking.status === 'قيد الانتظار';
              const isConfirmed = booking.status === 'مؤكد';
              const isCompleted = booking.status === 'مكتمل';

              // Get names of assigned riders for visual feedback
              const assignedRiderNames = riders
                .filter((r) => booking.assignedRiders.includes(r.id))
                .map((r) => r.name);

              return (
                <div
                  key={booking.id}
                  className={`glass-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/10 hover:scale-[1.005] transition-all duration-200 relative ${
                    isPending ? 'heritage-border-gold' : 'heritage-border'
                  } ${isCompleted ? 'opacity-70' : ''}`}
                >
                  <div className="flex flex-col gap-1 w-full md:w-auto">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                      <h3 className="text-lg font-bold font-headline text-white">
                        {booking.customerName}
                      </h3>
                      
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : isConfirmed
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                            : isCompleted
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-300 border-red-500/20'
                        }`}
                      >
                        {booking.status}
                      </span>

                      <span className="text-xs text-purple-300 font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {booking.ridersCount} خيّالاً
                      </span>

                      <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/20" title="من قام بالحجز">
                        بواسطة: {booking.createdBy || 'الزبون'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs">
                      <a
                        href={`tel:${booking.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:text-indigo-300 transition-colors cursor-pointer"
                        title="اتصال بالهاتف"
                      >
                        <PhoneCall size={13} className="text-indigo-400/80" />
                        <span>{booking.phone}</span>
                      </a>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-indigo-400/80" />
                        {formatDateArabic(booking.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-indigo-400/80" />
                        {booking.wilaya}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 mt-1.5 flex flex-col gap-0.5 border-t border-white/5 pt-1.5">
                      <p>
                        <span className="font-semibold text-indigo-300">الانطلاق:</span> {booking.startPoint}
                      </p>
                      <p>
                        <span className="font-semibold text-indigo-300">الوصول:</span> {booking.endPoint}
                      </p>
                      {(booking.quantityKg !== undefined || booking.count !== undefined) && (
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] bg-slate-950/40 p-1.5 rounded-lg border border-white/5 w-fit">
                          {booking.quantityKg !== undefined && booking.quantityKg > 0 && (
                            <span className="text-amber-300">
                              <strong className="text-slate-400">الكمية:</strong> {booking.quantityKg} كغ
                            </span>
                          )}
                          {booking.count !== undefined && booking.count > 0 && (
                            <span className="text-emerald-300">
                              <strong className="text-slate-400">العدد:</strong> {booking.count}
                            </span>
                          )}
                        </div>
                      )}
                      {assignedRiderNames.length > 0 && (
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <span className="font-bold text-purple-300">اللاعبون المعينون:</span>
                          {assignedRiderNames.map((name, idx) => (
                            <span key={idx} className="bg-indigo-500/10 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-500/20">
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right hand Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                    {booking.createdBy === `اللاعب: ${rider.name}` ? (
                      (booking.status === 'قيد الانتظار' || booking.status === 'مؤكد') ? (
                        <button
                          onClick={() => openAssignModal(booking)}
                          className={`flex-1 md:flex-none px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border ${
                            booking.status === 'قيد الانتظار'
                              ? 'btn-gradient text-white border-transparent'
                              : 'bg-white/5 hover:bg-white/10 text-indigo-300 border-white/10'
                          }`}
                        >
                          {booking.status === 'قيد الانتظار' ? (
                            <>
                              <UserPlus size={13} />
                              <span>تعيين اللاعبين</span>
                            </>
                          ) : (
                            <>
                              <Edit2 size={13} />
                              <span>تعديل الفريق</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button className="flex-1 md:flex-none px-4 py-2 bg-white/5 text-slate-500 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-default border border-white/5">
                          <CheckCircle size={13} />
                          <span>{booking.status === 'مكتمل' ? 'مكتمل ومنفّذ' : 'حجز ملغى'}</span>
                        </button>
                      )
                    ) : (
                      /* If not created by the rider, show 'Call Customer' button */
                      <a
                        href={`tel:${booking.phone}`}
                        className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                      >
                        <PhoneCall size={13} className="text-indigo-400" />
                        <span>اتصال بالزبون</span>
                      </a>
                    )}

                    {/* Edit Option for Rider-created booking */}
                    {booking.createdBy === `اللاعب: ${rider.name}` && booking.status !== 'ملغى' && booking.status !== 'مكتمل' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookingForEdit(booking);
                            setEditName(booking.customerName);
                            setEditPhone(booking.phone);
                            setEditDate(booking.date);
                            setEditWilaya(booking.wilaya);
                            setEditRidersCount(booking.ridersCount);
                            setEditStartPoint(booking.startPoint);
                            setEditEndPoint(booking.endPoint);
                            setEditAssignedRiders(booking.assignedRiders || []);
                            setEditRiderSearchQuery('');
                            setShowEditBookingModal(true);
                          }}
                          className="flex-1 md:flex-none px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white font-bold text-xs rounded-full transition-all border border-indigo-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Edit size={13} />
                          <span>تعديل الحجز</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCancellingBooking(booking)}
                          className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white font-bold text-xs rounded-full transition-all border border-red-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <X size={13} />
                          <span>إلغاء الحجز</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

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
                <span>حجز سريع جديد (لاعبين)</span>
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
                <label className="text-xs font-bold text-slate-300">اسم الزبون / صاحب الحفل</label>
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
                    className={`bg-white/5 border focus:ring-1 px-3 py-2 rounded-xl outline-none text-xs text-white placeholder-slate-500 ${
                      qbPhoneError 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    value={qbPhone}
                    onChange={(e) => {
                      setQbPhone(e.target.value);
                      if (qbPhoneError) setQbPhoneError('');
                    }}
                  />
                  {qbPhoneError && (
                    <p className="text-red-400 text-[10px] mt-1 font-bold">{qbPhoneError}</p>
                  )}
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
                  <label className="text-xs font-bold text-slate-300">عدد اللاعبين المطلوب</label>
                  <input
                    type="number"
                    min="2"
                    required
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-xl outline-none text-xs text-white"
                    value={qbRidersCount}
                    onChange={(e) => setQbRidersCount(parseInt(e.target.value) || 2)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">نقطة الانطلاق بالتفصيل</label>
                <input
                  type="text"
                  required
                  placeholder="مكان تجمع اللاعبين الأساسي"
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

              {/* New Additional Quick Booking Fields */}
              <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-indigo-300">الكمية بالكغ</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="مثال: 12"
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-2.5 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-600"
                    value={qbQuantityKg}
                    onChange={(e) => setQbQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-indigo-300">العدد</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="مثال: 3"
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-2.5 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-600"
                    value={qbCount}
                    onChange={(e) => setQbCount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
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
                disabled={submitting}
                className="px-6 py-2 btn-gradient text-white font-bold text-xs rounded-full hover:opacity-95 transition-opacity cursor-pointer border border-white/10"
              >
                {submitting ? 'جاري الحفظ...' : 'تأكيد وتسجيل الحجز'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Booking Modal Dialog */}
      {showEditBookingModal && selectedBookingForEdit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditBookingSubmit}
            className="glass-panel max-w-md w-full p-6 border border-white/15 animate-scale-up text-right space-y-4"
            dir="rtl"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-headline text-white flex items-center gap-1.5">
                <Edit size={18} className="text-indigo-400" />
                <span>تعديل بيانات الحجز</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditBookingModal(false);
                  setSelectedBookingForEdit(null);
                }}
                className="p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">اسم الزبون / صاحب الحفل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: السيد رشيد بن باديس"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    placeholder="05XXXXXXXX"
                    className={`bg-white/5 border focus:ring-1 px-3 py-2 rounded-xl outline-none text-xs text-white placeholder-slate-500 ${
                      editPhoneError 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                    value={editPhone}
                    onChange={(e) => {
                      setEditPhone(e.target.value);
                      if (editPhoneError) setEditPhoneError('');
                    }}
                  />
                  {editPhoneError && (
                    <p className="text-red-400 text-[10px] mt-1 font-bold">{editPhoneError}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">تاريخ العرض</label>
                  <input
                    type="date"
                    required
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-xl outline-none text-xs font-medium text-white"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">الولاية المعنية</label>
                  <select
                    className="bg-slate-900 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-xl outline-none text-xs font-medium text-white"
                    value={editWilaya}
                    onChange={(e) => setEditWilaya(e.target.value)}
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w} value={w} className="bg-slate-900 text-white">
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">عدد اللاعبين المطلوب</label>
                  <input
                    type="number"
                    min="2"
                    required
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-xl outline-none text-xs text-white"
                    value={editRidersCount}
                    onChange={(e) => setEditRidersCount(parseInt(e.target.value) || 2)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">نقطة الانطلاق بالتفصيل</label>
                <input
                  type="text"
                  required
                  placeholder="مكان تجمع اللاعبين الأساسي"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={editStartPoint}
                  onChange={(e) => setEditStartPoint(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">مكان العرض النهائي</label>
                <input
                  type="text"
                  required
                  placeholder="ساحة الاحتفال أو الملعب"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={editEndPoint}
                  onChange={(e) => setEditEndPoint(e.target.value)}
                />
              </div>


            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowEditBookingModal(false);
                  setSelectedBookingForEdit(null);
                }}
                className="px-5 py-2 border border-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-full hover:bg-white/5 cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 btn-gradient text-white font-bold text-xs rounded-full hover:opacity-95 transition-opacity cursor-pointer border border-white/10"
              >
                {updating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Riders Modal Dialog (similar to Admin) */}
      {assigningBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-center p-4 overflow-y-auto items-start sm:items-center">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/15 animate-scale-up text-right space-y-4 my-auto" dir="rtl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-headline text-white">
                تعيين لاعبين لـ: {assigningBooking.customerName}
              </h3>
              <button
                onClick={() => setAssigningBooking(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input for Riders */}
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="ابحث عن لاعب باسمه أو تخصصه الفني..."
                value={assignRiderSearchQuery}
                onChange={(e) => setAssignRiderSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 pr-10 pl-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
              />
            </div>

            {/* Selection Progress bar/Stat */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
              <span className="text-slate-400">
                العدد المطلوب: <strong className="text-indigo-400">{assigningBooking.ridersCount}</strong>
              </span>
              <span className="text-slate-400">
                المختارين حالياً: <strong className={selectedRiderIds.length >= assigningBooking.ridersCount ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{selectedRiderIds.length}</strong>
              </span>
            </div>

            {/* Riders List Scroll */}
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {(() => {
                const filteredRiders = riders.filter((r) =>
                  r.name.toLowerCase().includes(assignRiderSearchQuery.toLowerCase()) ||
                  r.type.toLowerCase().includes(assignRiderSearchQuery.toLowerCase())
                );

                if (filteredRiders.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs text-slate-500">
                      لا يوجد لاعبون أو باروديون يطابقون بحثك.
                    </div>
                  );
                }

                return filteredRiders.map((r) => {
                  const isSelected = selectedRiderIds.includes(r.id);
                  const isBusy = (r.status === 'في مهمة') || isRiderBusyOnDate(r.id, assigningBooking.date, assigningBooking.id);
                  const dynamicStatus = isBusy ? 'في مهمة' : 'متاح';
                  const isClickable = isSelected || !isBusy;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        if (!isClickable) return;
                        handleRiderToggle(r.id);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        !isClickable
                          ? 'border-red-500/10 bg-red-500/5 text-slate-500 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 cursor-pointer'
                          : 'border-white/10 hover:bg-white/5 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                          <img
                            src={r.image || undefined}
                            alt={r.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{r.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="bg-white/5 text-purple-300 px-1.5 rounded text-[10px] border border-white/10">
                              {r.type === 'خيال' ? 'لاعب' : 'بارود'}
                            </span>
                            <span className={isBusy ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                              • {dynamicStatus} {r.status === 'في مهمة' && !isRiderBusyOnDate(r.id, assigningBooking.date, assigningBooking.id) ? '(غير متاح للتعيين)' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Checkbox circle indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          !isClickable
                            ? 'border-red-500/20 bg-red-500/10 text-red-400'
                            : isSelected
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'border-white/20'
                        }`}
                      >
                        {!isClickable ? <X size={12} strokeWidth={3} /> : isSelected ? <Check size={12} strokeWidth={3} /> : null}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setAssigningBooking(null)}
                className="px-5 py-2 border border-white/10 text-slate-300 font-bold text-xs rounded-full hover:bg-white/5 cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={saveAssignments}
                className="px-6 py-2 btn-gradient text-white font-bold text-xs rounded-full cursor-pointer transition-opacity"
              >
                حفظ التعيينات وتحديث الفريق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Cancel Booking Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex justify-center p-4 items-center">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-right space-y-4 animate-scale-up" dir="rtl">
            <div className="flex items-center gap-3 text-red-400">
              <X size={24} className="shrink-0" />
              <h3 className="text-lg font-bold">تأكيد إلغاء الحجز</h3>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              هل أنت متأكد من إلغاء حجز <strong className="text-white">{cancellingBooking.customerName}</strong>؟ سيتم تغيير حالة الحجز إلى "ملغى"، ولا يمكن حذفه نهائياً.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                تراجع
              </button>
              <button
                onClick={async () => {
                  await onUpdateBooking(cancellingBooking.id, { status: 'ملغى' });
                  setCancellingBooking(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
