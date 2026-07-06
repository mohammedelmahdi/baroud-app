import React, { useState } from 'react';
import { Booking, Rider, BookingStatus } from '../types';
import { ALGERIAN_WILAYAS } from '../data/seedData';
import {
  FileText,
  Clock,
  Star,
  Phone,
  Calendar,
  MapPin,
  UserPlus,
  Edit2,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Check,
  X,
  UserCheck,
  User,
  Search,
  Users,
  Scale,
  Hash
} from 'lucide-react';

interface AdminBookingsViewProps {
  bookings: Booking[];
  riders: Rider[];
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onUpdateBooking: (id: string, updatedData: Partial<Booking>) => void;
  onAssignRiders: (bookingId: string, riderIds: string[]) => void;
  onDeleteBooking: (id: string) => void;
  ownedQuantityKg: number;
  ownedCount: number;
}

export default function AdminBookingsView({
  bookings,
  riders,
  onUpdateBookingStatus,
  onUpdateBooking,
  onAssignRiders,
  onDeleteBooking,
  ownedQuantityKg,
  ownedCount
}: AdminBookingsViewProps) {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'الكل'>('الكل');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [selectedRiderIds, setSelectedRiderIds] = useState<string[]>([]);
  const [riderSearchQuery, setRiderSearchQuery] = useState('');
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);

  // Editing Bookings States
  const [showEditBookingModal, setShowEditBookingModal] = useState<Booking | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPhoneError, setEditPhoneError] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editWilaya, setEditWilaya] = useState('');
  const [editRidersCount, setEditRidersCount] = useState(2);
  const [editStartPoint, setEditStartPoint] = useState('');
  const [editEndPoint, setEditEndPoint] = useState('');
  const [editBookingStatus, setEditBookingStatus] = useState<BookingStatus>('قيد الانتظار');
  const [editQuantityKg, setEditQuantityKg] = useState<number | ''>('');
  const [editCount, setEditCount] = useState<number | ''>('');
  const [editTotalPrice, setEditTotalPrice] = useState<number | ''>('');
  const [editPaidAmount, setEditPaidAmount] = useState<number | ''>('');

  // Open edit modal helper
  const openEditBookingModal = (booking: Booking) => {
    setShowEditBookingModal(booking);
    setEditCustomerName(booking.customerName);
    setEditPhone(booking.phone);
    setEditDate(booking.date);
    setEditWilaya(booking.wilaya);
    setEditRidersCount(booking.ridersCount);
    setEditStartPoint(booking.startPoint);
    setEditEndPoint(booking.endPoint);
    setEditBookingStatus(booking.status);
    setEditQuantityKg(booking.quantityKg !== undefined ? booking.quantityKg : '');
    setEditCount(booking.count !== undefined ? booking.count : '');
    setEditTotalPrice(booking.totalPrice !== undefined ? booking.totalPrice : '');
    setEditPaidAmount(booking.paidAmount !== undefined ? booking.paidAmount : '');
    setActiveMenuId(null);
  };

  // Save edited booking details
  const handleSaveBookingEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditPhoneError('');

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

    if (showEditBookingModal) {
      onUpdateBooking(showEditBookingModal.id, {
        customerName: editCustomerName,
        phone: cleanPhone,
        date: editDate,
        wilaya: editWilaya,
        ridersCount: editRidersCount,
        startPoint: editStartPoint,
        endPoint: editEndPoint,
        status: editBookingStatus,
        quantityKg: editQuantityKg !== '' ? Number(editQuantityKg) : undefined,
        count: editCount !== '' ? Number(editCount) : undefined,
        totalPrice: editTotalPrice !== '' ? Number(editTotalPrice) : undefined,
        paidAmount: editPaidAmount !== '' ? Number(editPaidAmount) : undefined,
      });
      setShowEditBookingModal(null);
      setEditPhoneError('');
    }
  };

  // Filtering bookings
  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'الكل') return true;
    return b.status === activeFilter;
  });

  // Calculate dynamic stats
  const totalBookingsCount = bookings.length + 1242; // Seeded count offset
  const pendingCount = bookings.filter((b) => b.status === 'قيد الانتظار').length + 18; // Seeded offset
  const topRiderName = 'سيف الدين. ب';

  // Calculate totals for confirmed/completed bookings only
  const activeBookings = bookings.filter(b => b.status === 'مؤكد' || b.status === 'مكتمل');
  const totalQuantity = activeBookings.reduce((sum, b) => sum + (b.quantityKg || 0), 0);
  const totalCount = activeBookings.reduce((sum, b) => sum + (b.count || 0), 0);
  const totalRidersNeeded = activeBookings.reduce((sum, b) => sum + (b.ridersCount || 0), 0);

  const remainingQuantity = ownedQuantityKg - totalQuantity;
  const remainingCount = ownedCount - totalCount;

  // Toggle dropdown menu
  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Open rider assignment modal
  const openAssignModal = (booking: Booking) => {
    setAssigningBooking(booking);
    setSelectedRiderIds([...booking.assignedRiders]);
    setRiderSearchQuery('');
    setActiveMenuId(null);
  };

  // Handle rider checkbox toggle
  const handleRiderToggle = (riderId: string) => {
    if (selectedRiderIds.includes(riderId)) {
      setSelectedRiderIds(selectedRiderIds.filter((id) => id !== riderId));
    } else {
      const rider = riders.find((r) => r.id === riderId);
      const isAssignedElsewhere = (bookings || []).some(
        (b) => b.date === assigningBooking?.date && b.id !== assigningBooking?.id && b.status !== 'ملغى' && b.assignedRiders.includes(riderId)
      );
      const isBusy = (rider?.status === 'في مهمة') || isAssignedElsewhere;
      if (isBusy) {
        return;
      }
      setSelectedRiderIds([...selectedRiderIds, riderId]);
    }
  };

  // Save rider assignment
  const saveAssignments = () => {
    if (assigningBooking) {
      onAssignRiders(assigningBooking.id, selectedRiderIds);
      // Auto upgrade status to Confirmed if it was Pending and riders are assigned
      if (assigningBooking.status === 'قيد الانتظار' && selectedRiderIds.length > 0) {
        onUpdateBookingStatus(assigningBooking.id, 'مؤكد');
      }
      setAssigningBooking(null);
    }
  };

  return (
    <div className="space-y-8 text-right font-sans" dir="rtl">

      {/* Tabs Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {(['الكل', 'قيد الانتظار', 'مؤكد', 'مكتمل', 'ملغى'] as const).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg border border-white/10'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Booking Cards Stack */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10 text-slate-400 font-medium text-sm">
            لا توجد حجوزات تطابق هذا التصنيف حاليًا.
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const isPending = booking.status === 'قيد الانتظار';
            const isConfirmed = booking.status === 'مؤكد';
            const isCompleted = booking.status === 'مكتمل';
            const isCancelled = booking.status === 'ملغى';

            // Get names of assigned riders for visual feedback
            const assignedRiderNames = riders
              .filter((r) => booking.assignedRiders.includes(r.id))
              .map((r) => r.name);

            return (
              <div
                key={booking.id}
                onClick={() => openEditBookingModal(booking)}
                className={`glass-card-interactive p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/10 hover:scale-[1.005] transition-all duration-200 relative cursor-pointer ${
                  activeMenuId === booking.id ? 'z-30' : 'z-10'
                } ${
                  isPending ? 'heritage-border-gold' : 'heritage-border'
                } ${isCompleted ? 'opacity-70' : ''}`}
                title="اضغط لتعديل معلومات الحجز"
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
                      <Phone size={13} className="text-indigo-400/80" />
                      <span>{booking.phone}</span>
                    </a>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-indigo-400/80" />
                      {booking.date}
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
                            <strong className="text-slate-400">البارود:</strong> {booking.quantityKg} كغ
                          </span>
                        )}
                        {booking.count !== undefined && booking.count > 0 && (
                          <span className="text-emerald-300">
                            <strong className="text-slate-400">الكبسول:</strong> {booking.count} حبة
                          </span>
                        )}
                      </div>
                    )}

                    {/* Financial/Billing Tracking Block */}
                    {booking.totalPrice !== undefined && booking.totalPrice > 0 && (
                      <div className="mt-2 text-[10px] bg-indigo-950/20 border border-indigo-500/10 p-2 rounded-xl space-y-1 w-full max-w-sm">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>سعر الحجز: <strong className="text-white">{(booking.totalPrice).toLocaleString()} دج</strong></span>
                          <span>المدفوع: <strong className="text-emerald-400">{(booking.paidAmount || 0).toLocaleString()} دج</strong></span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-1">
                          <span className="text-slate-400">المتبقي:</span>
                          {((booking.totalPrice || 0) - (booking.paidAmount || 0)) <= 0 ? (
                            <span className="bg-emerald-500/15 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-bold">
                              مدفوع بالكامل
                            </span>
                          ) : (booking.paidAmount || 0) > 0 ? (
                            <span className="text-amber-400 font-bold">
                              {((booking.totalPrice || 0) - (booking.paidAmount || 0)).toLocaleString()} دج (جزئي)
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold">
                              {((booking.totalPrice || 0) - (booking.paidAmount || 0)).toLocaleString()} دج (غير مدفوع)
                            </span>
                          )}
                        </div>
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
                <div 
                  className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isPending && (
                    <button
                      onClick={() => openAssignModal(booking)}
                      className="flex-1 md:flex-none px-5 py-2 btn-gradient rounded-full text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity active:scale-95 cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>تعيين اللاعبين</span>
                    </button>
                  )}

                  {isConfirmed && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => openAssignModal(booking)}
                        className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-indigo-300 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                      >
                        <Edit2 size={13} />
                        <span>تعديل الفريق</span>
                      </button>
                      
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'مكتمل')}
                        className="flex-1 md:flex-none px-4 py-2 btn-gradient rounded-full text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-95 transition-all active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 size={13} />
                        <span>تم التنفيذ</span>
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <button className="flex-1 md:flex-none px-5 py-2 bg-white/5 text-slate-500 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-default border border-white/5">
                      <CheckCircle2 size={14} />
                      <span>تم التنفيذ واكتمل</span>
                    </button>
                  )}

                  {isCancelled && (
                    <span className="text-xs font-bold text-red-300 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                      حجز ملغى
                    </span>
                  )}

                  {/* Contextual More Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => toggleMenu(booking.id, e)}
                      className="p-2 rounded-full border border-white/10 text-indigo-300 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Dropdown Options */}
                    {activeMenuId === booking.id && (
                      <div className="absolute left-0 bottom-full mb-2 w-44 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/15 z-30 py-1.5 animate-scale-up text-right">
                        {!isConfirmed && booking.status !== 'مؤكد' && (
                          <button
                            onClick={() => {
                              onUpdateBookingStatus(booking.id, 'مؤكد');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 text-right flex items-center gap-2 cursor-pointer"
                          >
                            <UserCheck size={14} className="text-emerald-400" />
                            <span>تأكيد الحجز</span>
                          </button>
                        )}
                        
                        {!isPending && booking.status !== 'قيد الانتظار' && (
                          <button
                            onClick={() => {
                              onUpdateBookingStatus(booking.id, 'قيد الانتظار');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 text-right flex items-center gap-2 cursor-pointer"
                          >
                            <Clock size={14} className="text-amber-400" />
                            <span>وضعه قيد الانتظار</span>
                          </button>
                        )}

                        {!isCancelled && (
                          <button
                            onClick={() => {
                              onUpdateBookingStatus(booking.id, 'ملغى');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-red-400 hover:bg-white/5 text-right flex items-center gap-2 cursor-pointer"
                          >
                            <X size={14} />
                            <span>إلغاء الحجز</span>
                          </button>
                        )}

                        <div className="h-[1px] bg-white/5 my-1" />

                        <button
                          onClick={() => {
                            setDeletingBooking(booking);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-xs font-bold text-red-400 hover:bg-white/10 text-right flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 size={14} />
                          <span>حذف الحجز</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assign Riders Modal Dialog */}
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
                value={riderSearchQuery}
                onChange={(e) => setRiderSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 pr-10 pl-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
              />
            </div>

            {/* Selection Progress bar/Stat */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
              <span className="text-slate-400">
                العدد المطلوب: <strong className="text-indigo-400">{assigningBooking.ridersCount}</strong>
              </span>
              <span className="text-slate-400">
                المختارين حالياً: <strong className={selectedRiderIds.length >= assigningBooking.ridersCount ? "text-emerald-400" : "text-amber-400"}>{selectedRiderIds.length}</strong>
              </span>
            </div>

            {/* Riders List Scroll */}
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {(() => {
                const filteredRiders = riders.filter((rider) =>
                  rider.name.toLowerCase().includes(riderSearchQuery.toLowerCase()) ||
                  rider.type.toLowerCase().includes(riderSearchQuery.toLowerCase())
                );

                if (filteredRiders.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs text-slate-500">
                      لا يوجد لاعبون أو باروديون يطابقون بحثك.
                    </div>
                  );
                }

                return filteredRiders.map((rider) => {
                  const isSelected = selectedRiderIds.includes(rider.id);
                  const isAssignedElsewhere = (bookings || []).some(
                    (b) => b.date === assigningBooking.date && b.id !== assigningBooking.id && b.status !== 'ملغى' && b.assignedRiders.includes(rider.id)
                  );
                  const isBusy = (rider.status === 'في مهمة') || isAssignedElsewhere;
                  const dynamicStatus = isBusy ? 'في مهمة' : 'متاح';
                  const isClickable = isSelected || !isBusy;
                  return (
                    <div
                      key={rider.id}
                      onClick={() => {
                        if (!isClickable) return;
                        handleRiderToggle(rider.id);
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
                            src={rider.image || undefined}
                            alt={rider.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{rider.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="bg-white/5 text-purple-300 px-1.5 rounded text-[10px] border border-white/10">
                              {rider.type === 'خيال' ? 'لاعب' : 'بارود'}
                            </span>
                            <span className={isBusy ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                              • {dynamicStatus} {rider.status === 'في مهمة' && !isAssignedElsewhere ? '(غير متاح للتعيين)' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Checkbox circle indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          !isClickable ? 'border-red-900/40 bg-red-900/10 text-red-400' :
                          isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
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

      {/* Edit Booking Modal Dialog */}
      {showEditBookingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-center p-4 overflow-y-auto items-start sm:items-center">
          <form
            onSubmit={handleSaveBookingEdit}
            className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/15 animate-scale-up text-right space-y-4 scrollbar-thin scrollbar-thumb-white/10 my-auto"
            dir="rtl"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-headline text-white">
                تعديل معلومات الحجز
              </h3>
              <button
                type="button"
                onClick={() => setShowEditBookingModal(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <User size={13} className="text-indigo-400" />
                  اسم العميل أو الجهة الطالبة
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بلدية أولاد جلال أو جمعية التراث"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Phone size={13} className="text-indigo-400" />
                  رقم الهاتف للتواصل
                </label>
                <input
                  type="tel"
                  required
                  placeholder="مثال: 0661000000"
                  className={`bg-white/5 border focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500 text-left ${
                    editPhoneError 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-white/10 focus:border-indigo-500'
                  }`}
                  dir="ltr"
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
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Calendar size={13} className="text-indigo-400" />
                  التاريخ المخطط للعرض
                </label>
                <input
                  type="date"
                  required
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500 text-left"
                  dir="ltr"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <MapPin size={13} className="text-indigo-400" />
                  الولاية الجزائرية
                </label>
                <select
                  className="bg-slate-950 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs font-medium text-white"
                  value={editWilaya}
                  onChange={(e) => setEditWilaya(e.target.value)}
                >
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <UserPlus size={13} className="text-indigo-400" />
                  عدد اللاعبين المطلوبين
                </label>
                <input
                  type="number"
                  required
                  min={2}
                  max={100}
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white"
                  value={editRidersCount}
                  onChange={(e) => setEditRidersCount(parseInt(e.target.value) || 2)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  مكان نقطة الانطلاق واللقاء
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: من أمام المسجد الكبير"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={editStartPoint}
                  onChange={(e) => setEditStartPoint(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  مكان نقطة الوصول والعرض
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ساحة البلدية والاحتفالات"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={editEndPoint}
                  onChange={(e) => setEditEndPoint(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  حالة الحجز الحالية
                </label>
                <select
                  className="bg-slate-950 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs font-medium text-white"
                  value={editBookingStatus}
                  onChange={(e) => setEditBookingStatus(e.target.value as BookingStatus)}
                >
                  <option value="قيد الانتظار">قيد الانتظار</option>
                  <option value="مؤكد">مؤكد</option>
                  <option value="مكتمل">مكتمل</option>
                  <option value="ملغى">ملغى</option>
                </select>
              </div>

              {/* Three additional editable fields */}
              <div className="grid grid-cols-2 gap-2 sm:col-span-2 border-t border-white/5 pt-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-indigo-300">البارود (كغ)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="مثال: 12"
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-2.5 py-2 rounded-xl outline-none text-xs text-white placeholder-slate-600"
                    value={editQuantityKg}
                    onChange={(e) => setEditQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-indigo-300">الكبسول (حبة)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="مثال: 3"
                    className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-2.5 py-2 rounded-xl outline-none text-xs text-white placeholder-slate-600"
                    value={editCount}
                    onChange={(e) => setEditCount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Pricing & Billing fields */}
              <div className="grid grid-cols-2 gap-2 sm:col-span-2 border-t border-white/5 pt-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-emerald-400">سعر الحجز الإجمالي (دج)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="مثال: 35000"
                    className="bg-white/5 border border-white/10 focus:border-emerald-500 focus:ring-0 px-2.5 py-2 rounded-xl outline-none text-xs text-white placeholder-slate-600"
                    value={editTotalPrice}
                    onChange={(e) => setEditTotalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-emerald-400">المبلغ المدفوع (دج)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="مثال: 15000"
                    className="bg-white/5 border border-white/10 focus:border-emerald-500 focus:ring-0 px-2.5 py-2 rounded-xl outline-none text-xs text-white placeholder-slate-600"
                    value={editPaidAmount}
                    onChange={(e) => setEditPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              {editTotalPrice !== '' && (
                <div className="sm:col-span-2 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">المبلغ المتبقي:</span>
                  <span className={`font-bold ${Number(editTotalPrice) - Number(editPaidAmount || 0) <= 0 ? 'text-emerald-400' : 'text-amber-400'}`} dir="ltr">
                    {(Number(editTotalPrice) - Number(editPaidAmount || 0)).toLocaleString()} دج
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowEditBookingModal(null)}
                className="px-5 py-2 border border-white/10 text-slate-300 font-bold text-xs rounded-full hover:bg-white/5 cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 btn-gradient text-white font-bold text-xs rounded-full cursor-pointer transition-opacity"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Delete Booking Confirmation Modal */}
      {deletingBooking && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[60] flex justify-center p-4 items-center">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-right space-y-4 animate-scale-up" dir="rtl">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 size={24} className="shrink-0" />
              <h3 className="text-lg font-bold">تأكيد حذف الحجز</h3>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              هل أنت متأكد من حذف حجز <strong className="text-white">{deletingBooking.customerName}</strong> نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingBooking(null)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  onDeleteBooking(deletingBooking.id);
                  setDeletingBooking(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
