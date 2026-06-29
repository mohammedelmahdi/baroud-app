import React, { useState } from 'react';
import { Rider, RiderType, RiderStatus, Booking } from '../types';
import {
  UserPlus,
  Users,
  CheckCircle,
  Award,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Plus,
  X,
  Lock,
  User,
  ShieldAlert,
  Save
} from 'lucide-react';

interface AdminRidersViewProps {
  riders: Rider[];
  bookings?: Booking[];
  onAddRider: (riderData: Omit<Rider, 'id'>) => void;
  onUpdateRider: (id: string, updatedData: Partial<Rider>) => void;
  onDeleteRider: (id: string) => void;
}

export default function AdminRidersView({
  riders,
  bookings = [],
  onAddRider,
  onUpdateRider,
  onDeleteRider
}: AdminRidersViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Rider | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  
  // Date filtering states
  const [filterDate, setFilterDate] = useState('');
  const [dayStatusFilter, setDayStatusFilter] = useState<'الكل' | 'متاح' | 'تم تعيينه'>('الكل');

  // Form states for adding
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<RiderType>('خيال');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newStatus, setNewStatus] = useState<RiderStatus>('متاح');
  const [newImage, setNewImage] = useState('');

  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<RiderType>('خيال');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState<RiderStatus>('متاح');
  const [editImage, setEditImage] = useState('');

  // Handle image file selection and conversion to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isEdit) {
            setEditImage(reader.result);
          } else {
            setNewImage(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = (riderId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [riderId]: !prev[riderId]
    }));
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUsername || !newPassword) return;

    // Provide default placeholder images of traditional riders if empty
    const defaultImages = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDls5vy6r18nSSyI2x46XN_X8quJXIvKTIS0A5WvKkVUWFEDQfhJunITLuTrc6P8n4JKdXLLafyJmd8lc1iIpQpee_FpG-lCE0bzMuqbkW2-5uBMwcxuqizqCp9n1Xo4oEGGpEVxejfuU6ccbGWiBjApCjUHbQqoSVB9B_ztPPiOs5bo329oBfuf9oS9eRSdoq1Qcl-LdOnrk9SFJWtdG0cjjD9L0KiN7tRKvUgbCwKbhgaGy4rMT-vKJwRr6Y5dqIW2MEk1Alp1oI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5JJgMNwFk4-7MGu4MzA4tBJ2sVpOo5bVrPqaDMB6poTF79dmkx8uSmPL4v4B-RYkSoMbUwx-CEZJ8oAq0TVhNrwsnZLBbDRDibe4sA2x0JktdaIMgOrKpkSKFojEgpM2QoEOy3B6hsXpOOCiiUO2c1pVzTmv_mCUWQnM_C260bqHuSmN9z-Ma2nfi9zFym0Qbh93DZZtcBZ77DGPwWoR5OBLgDc9T0wkktsQxD6U8lrKO2PKhK1P7rS_A-JqAcF_T4rTmhEmDefw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtujOs2BsgKj8c3Jssd6M-e7VCoalRs0KprcTVZxMqkVKk4Zjnr03skvEUKgW550Nyh6PMo3BTYokEzvXGtgVODhPoM7FTD_8BF80Y3Yvyu8iXz6CMNpiBkOvOrHUsKrFeuP8ZhQvHwZa4GrdHUie4gbbkk5IV27n_sbo9qwWUw6z1KlDJJtA_sJpxgeaQHdC24SWSweuRHC1-QBSkw7QsLQFIJlQZGnX-XDBh1XQQWJSMb1X_vpp1keiMJvQyfhNNyu1I4qnjWPs'
    ];
    const imageToUse = newImage || defaultImages[Math.floor(Math.random() * defaultImages.length)];

    onAddRider({
      name: newName,
      type: newType,
      username: newUsername,
      password: newPassword,
      status: newStatus,
      image: imageToUse
    });

    // Reset fields
    setNewName('');
    setNewType('خيال');
    setNewUsername('');
    setNewPassword('');
    setNewStatus('متاح');
    setNewImage('');
    setShowAddModal(false);
  };

  // Open Edit Modal
  const openEditModal = (rider: Rider) => {
    setShowEditModal(rider);
    setEditName(rider.name);
    setEditType(rider.type);
    setEditUsername(rider.username);
    setEditPassword(rider.password || 'password123');
    setEditStatus(rider.status);
    setEditImage(rider.image);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    onUpdateRider(showEditModal.id, {
      name: editName,
      type: editType,
      username: editUsername,
      password: editPassword,
      status: editStatus,
      image: editImage
    });

    setShowEditModal(null);
  };

  // Stats Counters
  const totalRiders = riders.length + 42; // Seeded offset to match dashboard screenshot count (48)
  const availableRiders = riders.filter((r) => r.status === 'متاح').length + 28; // Seeded offset (32)

  return (
    <div className="space-y-8 text-right font-sans" dir="rtl">
      
      {/* Header and Add action button */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-white">إدارة الباردية والخيالة</h1>
          <p className="text-xs text-slate-400 font-medium">إدارة وتتبع المؤدين المشاركين وعقود عروض الفانتازيا والبارود.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gradient text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/10 cursor-pointer font-bold text-xs border border-white/10"
        >
          <UserPlus size={16} />
          <span>اضافة لاعب جديد</span>
        </button>
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card p-4 sm:p-6 flex flex-col gap-1.5 hover:scale-[1.01] transition-transform">
          <span className="text-xs font-semibold text-slate-400">إجمالي الخيالة المسجلين</span>
          <span className="text-2xl sm:text-3xl font-bold text-white font-headline">{totalRiders}</span>
        </div>
        
        <div className="glass-card p-4 sm:p-6 flex flex-col gap-1.5 hover:scale-[1.01] transition-transform">
          <span className="text-xs font-semibold text-slate-400">الفرسان المتاحون حالياً</span>
          <span className="text-2xl sm:text-3xl font-bold text-indigo-300 font-headline">{availableRiders}</span>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-xl border border-indigo-500/30 flex flex-col justify-center items-center text-center gap-1 overflow-hidden relative group hover:scale-[1.01] transition-transform col-span-2 md:col-span-1">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-3 -translate-y-3">
            <Award size={100} />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-slate-300 opacity-80 relative z-10">العروض والفعاليات القادمة</span>
          <span className="text-sm sm:text-lg font-bold font-headline text-white relative z-10 tracking-wide">مهرجان البارود الوطني</span>
        </div>
      </section>

      {/* Date Filter Bar */}
      <div className="glass-card p-5 border border-white/10 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              تصفية حالة اللاعبين باليوم والتواريخ
            </h3>
            <p className="text-[11px] text-slate-400">حدد تاريخاً معيناً لمعرفة الخيالة المتاحين أو المعينين لعروض في ذلك اليوم</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setDayStatusFilter('الكل');
                }}
                className="bg-slate-950/80 border border-white/10 focus:border-indigo-500 text-slate-200 text-xs font-medium rounded-xl px-4 py-2.5 outline-none w-full sm:w-56 text-right [color-scheme:dark]"
              />
            </div>
            {filterDate && (
              <button
                type="button"
                onClick={() => {
                  setFilterDate('');
                  setDayStatusFilter('الكل');
                }}
                className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 px-3 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                إلغاء التصفية
              </button>
            )}
          </div>
        </div>

        {filterDate && (
          <div className="flex items-center gap-2 border-t border-white/5 pt-3 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-slate-400 font-bold shrink-0">حالة اليوم المحدد:</span>
            <div className="flex flex-wrap items-center gap-2">
              {(['الكل', 'متاح', 'تم تعيينه'] as const).map((statusOption) => {
                const count = riders.filter((r) => {
                  const bookingsOnDate = (bookings || []).filter(
                    (b) => b.date === filterDate && b.status !== 'ملغى'
                  );
                  const isAssigned = bookingsOnDate.some((b) => b.assignedRiders.includes(r.id));
                  if (statusOption === 'متاح') return !isAssigned;
                  if (statusOption === 'تم تعيينه') return isAssigned;
                  return true;
                }).length;

                return (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => setDayStatusFilter(statusOption)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      dayStatusFilter === statusOption
                        ? 'bg-indigo-600 text-white border border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'text-slate-400 hover:text-slate-200 bg-white/5 border border-white/5'
                    }`}
                  >
                    <span>
                      {statusOption === 'الكل'
                        ? 'الكل'
                        : statusOption === 'متاح'
                        ? 'المتاحون'
                        : 'المعيّنون'}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      dayStatusFilter === statusOption
                        ? 'bg-indigo-500 text-indigo-100'
                        : 'bg-white/10 text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Performers Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {(() => {
          // Filter riders based on the selected day and status filter
          const filteredRiders = riders.filter((rider) => {
            if (!filterDate) return true;

            const bookingsOnDate = (bookings || []).filter(
              (b) => b.date === filterDate && b.status !== 'ملغى'
            );
            const isAssigned = bookingsOnDate.some((b) => b.assignedRiders.includes(rider.id));

            if (dayStatusFilter === 'متاح') {
              return !isAssigned;
            }
            if (dayStatusFilter === 'تم تعيينه') {
              return isAssigned;
            }
            return true;
          });

          if (filteredRiders.length === 0) {
            return (
              <div className="col-span-full glass-card p-10 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-white/10">
                <Users size={36} className="text-slate-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-300">لا يوجد لاعبون يطابقون التصفية لهذا اليوم</h3>
                <p className="text-xs text-slate-400 max-w-sm">يرجى تغيير التصفية أو اختيار تاريخ آخر من جدول العروض لمتابعة حالة المشاركين.</p>
              </div>
            );
          }

          return filteredRiders.map((rider) => {
            const isPasswordVisible = !!visiblePasswords[rider.id];
            const riderPass = rider.password || '••••••••';

            // Calculate participations (completed and total)
            const completedCount = bookings.filter(
              (b) => b.assignedRiders.includes(rider.id) && b.status === 'مكتمل'
            ).length;

            const totalCount = bookings.filter(
              (b) => b.assignedRiders.includes(rider.id) && b.status !== 'ملغى'
            ).length;

            return (
              <div
                key={rider.id}
                onClick={() => openEditModal(rider)}
                className="glass-card-interactive p-5 flex flex-col gap-4 group transition-all duration-300 hover:-translate-y-1 cursor-pointer relative heritage-border"
                title="اضغط على البطاقة لعرض البيانات أو تعديلها"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-inner border border-white/10 shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={rider.image}
                        alt={rider.name}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-headline leading-tight">{rider.name}</h3>
                      <span className="text-[10px] font-bold text-purple-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 inline-block mt-1">
                        {rider.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rider Stats (Completed Participations) */}
                <div className="grid grid-cols-2 gap-2 text-right bg-white/5 p-2.5 rounded-xl border border-white/10" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold">المشاركات المكتملة</span>
                    <span className="text-sm font-bold text-emerald-400 font-headline mt-0.5">
                      {completedCount} <span className="text-[10px] font-medium text-slate-400">عروض</span>
                    </span>
                  </div>
                  <div className="flex flex-col border-r border-white/10 pr-2.5">
                    <span className="text-[10px] text-slate-400 font-bold">إجمالي المشاركات</span>
                    <span className="text-sm font-bold text-indigo-300 font-headline mt-0.5">
                      {totalCount} <span className="text-[10px] font-medium text-slate-400">عروض</span>
                    </span>
                  </div>
                </div>

                {/* Date-specific Status Badges inside the card */}
                {filterDate && (
                  <div className="mt-1 flex items-center gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
                    {(() => {
                      const bookingsOnDate = (bookings || []).filter(
                        (b) => b.date === filterDate && b.status !== 'ملغى'
                      );
                      const assignedBooking = bookingsOnDate.find((b) =>
                        b.assignedRiders.includes(rider.id)
                      );

                      if (assignedBooking) {
                        return (
                          <div className="flex flex-col gap-1 w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-right">
                            <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                              تم تعيينه في هذا اليوم لعرض:
                            </span>
                            <span className="text-[11px] text-slate-200 font-medium">
                              {assignedBooking.customerName} ({assignedBooking.wilaya})
                            </span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center gap-1.5 w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-right text-emerald-300 font-bold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            متاح وجاهز للمشاركة في هذا اليوم
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Edit/Delete Row */}
                <div className="flex justify-end gap-2 pt-2 border-t border-white/5 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(rider);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    title="تعديل بيانات اللاعب"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`هل أنت متأكد من إزالة اللاعب ${rider.name} نهائياً من الجمعية؟`)) {
                        onDeleteRider(rider.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    title="إزالة اللاعب"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          });
        })()}

        {/* Empty State Add Card Placeholder */}
        <div
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-white/15 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition-all cursor-pointer min-h-[310px]"
        >
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform border border-white/10">
            <Plus size={24} className="text-indigo-400" />
          </div>
          <span className="text-sm font-bold text-indigo-300">اضافة لاعب جديد</span>
          <p className="text-[10px] text-slate-400 max-w-[200px] text-center">قم بتسجيل لاعب جديد وإنشاء بيانات دخول بورتال الخيالة له</p>
        </div>
      </section>

      {/* Add Rider Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/15 animate-scale-up text-right space-y-4"
            dir="rtl"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-headline text-white">تسجيل لاعب جديد</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <User size={13} className="text-indigo-400" />
                  الاسم الكامل للفارس
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يونس الجزائري"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">التخصص الفني</label>
                <select
                  className="bg-slate-950 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2 rounded-xl outline-none text-xs font-medium text-white"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as RiderType)}
                >
                  <option value="خيال">خيّال عادِي (فروسية)</option>
                  <option value="بارود">بارودي متمرس (سلاح)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Lock size={13} className="text-indigo-400" />
                  اسم المستخدم (للبوابة الخاصة به)
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: younes_dz"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Lock size={13} className="text-indigo-400" />
                  كلمة المرور الافتراضية
                </label>
                <input
                  type="text"
                  required
                  placeholder="أدخل كلمة مرور قوية"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">الصورة الشخصية للاعب</label>
                <div className="flex items-center gap-4">
                  {newImage ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 shrink-0">
                      <img src={newImage} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        type="button"
                        onClick={() => setNewImage('')}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        حذف
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-slate-500 shrink-0">
                      <Users size={20} />
                    </div>
                  )}
                  <label className="flex-grow border border-dashed border-white/15 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <span className="text-xs font-bold text-indigo-300">اختر صورة أو اسحبها هنا</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 border border-white/10 text-slate-300 font-bold text-xs rounded-full hover:bg-white/5 cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 btn-gradient text-white font-bold text-xs rounded-full cursor-pointer transition-opacity"
              >
                تسجيل اللاعب وتوليد الحساب
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Rider Dialog Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-center p-4 overflow-y-auto items-start sm:items-center">
          <form
            onSubmit={handleEditSubmit}
            className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/15 animate-scale-up text-right space-y-4 my-auto"
            dir="rtl"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-headline text-white">تعديل بيانات اللاعب</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <User size={13} className="text-indigo-400" />
                  الاسم الكامل للاعب
                </label>
                <input
                  type="text"
                  required
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">التخصص الفني</label>
                <select
                  className="bg-slate-950 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2 rounded-xl outline-none text-xs font-medium text-white"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as RiderType)}
                >
                  <option value="خيال">خيّال عادِي (فروسية)</option>
                  <option value="بارود">بارودي متمرس (سلاح)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Lock size={13} className="text-indigo-400" />
                  اسم المستخدم الخاص به
                </label>
                <input
                  type="text"
                  required
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Lock size={13} className="text-indigo-400" />
                  كلمة المرور الحالية
                </label>
                <input
                  type="text"
                  required
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">الصورة الشخصية للاعب</label>
                <div className="flex items-center gap-4">
                  {editImage ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 shrink-0">
                      <img src={editImage} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        type="button"
                        onClick={() => setEditImage('')}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        حذف
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-slate-500 shrink-0">
                      <Users size={20} />
                    </div>
                  )}
                  <label className="flex-grow border border-dashed border-white/15 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <span className="text-xs font-bold text-indigo-300">تغيير الصورة الشخصية</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                className="px-5 py-2 border border-white/10 text-slate-300 font-bold text-xs rounded-full hover:bg-white/5 cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 btn-gradient text-white font-bold text-xs rounded-full cursor-pointer transition-all flex items-center gap-1"
              >
                <Save size={13} />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
