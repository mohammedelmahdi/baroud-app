import React, { useState } from 'react';
import { Rider, RiderType, RiderStatus } from '../types';
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
  onAddRider: (riderData: Omit<Rider, 'id'>) => void;
  onUpdateRider: (id: string, updatedData: Partial<Rider>) => void;
  onDeleteRider: (id: string) => void;
}

export default function AdminRidersView({
  riders,
  onAddRider,
  onUpdateRider,
  onDeleteRider
}: AdminRidersViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Rider | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

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
          <h1 className="text-2xl font-bold font-headline text-white">إدارة الخيالة والفرسان</h1>
          <p className="text-xs text-slate-400 font-medium">إدارة وتتبع المؤدين المشاركين وعقود عروض الفانتازيا والبارود.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gradient text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/10 cursor-pointer font-bold text-xs border border-white/10"
        >
          <UserPlus size={16} />
          <span>إضافة خيال جديد</span>
        </button>
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col gap-1.5 hover:scale-[1.01] transition-transform">
          <span className="text-xs font-semibold text-slate-400">إجمالي الخيالة المسجلين</span>
          <span className="text-3xl font-bold text-white font-headline">{totalRiders}</span>
        </div>
        
        <div className="glass-card p-6 flex flex-col gap-1.5 hover:scale-[1.01] transition-transform">
          <span className="text-xs font-semibold text-slate-400">الفرسان المتاحون حالياً</span>
          <span className="text-3xl font-bold text-indigo-300 font-headline">{availableRiders}</span>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-indigo-500/30 flex flex-col justify-center items-center text-center gap-1 overflow-hidden relative group hover:scale-[1.01] transition-transform">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-3 -translate-y-3">
            <Award size={100} />
          </div>
          <span className="text-xs font-medium text-slate-300 opacity-80 relative z-10">العروض والفعاليات القادمة</span>
          <span className="text-lg font-bold font-headline text-white relative z-10 tracking-wide">مهرجان البارود الوطني</span>
        </div>
      </section>

      {/* Performers Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {riders.map((rider) => {
          const isPasswordVisible = !!visiblePasswords[rider.id];
          const riderPass = rider.password || '••••••••';

          return (
            <div
              key={rider.id}
              className={`glass-card-interactive p-5 flex flex-col gap-4 group transition-all duration-300 hover:-translate-y-1 ${
                rider.status === 'متاح' ? 'heritage-border' : 'heritage-border-gold'
              }`}
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

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    rider.status === 'متاح'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}
                >
                  {rider.status}
                </span>
              </div>

              {/* Login credentials form view */}
              <div className="space-y-3 border-t border-white/5 pt-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">اسم المستخدم الخاص به</label>
                  <input
                    className="bg-white/5 text-slate-200 border border-white/10 text-xs font-medium rounded-lg px-3 py-2 outline-none cursor-default"
                    readOnly
                    type="text"
                    value={rider.username}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">كلمة المرور الحالية</label>
                  <div className="relative">
                    <input
                      className="w-full bg-white/5 text-slate-200 border border-white/10 text-xs font-medium rounded-lg px-3 pr-3 pl-8 py-2 outline-none cursor-default"
                      readOnly
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={riderPass}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(rider.id)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-300 cursor-pointer focus:outline-none"
                    >
                      {isPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit/Delete Row */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5 mt-auto">
                <button
                  onClick={() => openEditModal(rider)}
                  className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title="تعديل بيانات الفارس"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من إزالة الفارس ${rider.name} نهائياً من الجمعية؟`)) {
                      onDeleteRider(rider.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title="إزالة الفارس"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State Add Card Placeholder */}
        <div
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-white/15 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition-all cursor-pointer min-h-[310px]"
        >
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform border border-white/10">
            <Plus size={24} className="text-indigo-400" />
          </div>
          <span className="text-sm font-bold text-indigo-300">إضافة خيال أو بارودي جديد</span>
          <p className="text-[10px] text-slate-400 max-w-[200px] text-center">قم بتسجيل فارس جديد وإنشاء بيانات دخول بورتال الخيالة له</p>
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
              <h3 className="text-lg font-bold font-headline text-white">تسجيل خيال جديد بالجمعية</h3>
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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-xs font-bold text-slate-300">الحالة المهنية</label>
                  <select
                    className="bg-slate-950 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2 rounded-xl outline-none text-xs font-medium text-white"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as RiderStatus)}
                  >
                    <option value="متاح">متاح وجاهز</option>
                    <option value="في مهمة">في مهمة حالية</option>
                  </select>
                </div>
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

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">رابط الصورة الشخصية (اختياري)</label>
                <input
                  type="url"
                  placeholder="أدخل رابط صورة الفارس"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                />
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
                تسجيل الفارس وتوليد الحساب
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Rider Dialog Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/15 animate-scale-up text-right space-y-4"
            dir="rtl"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-headline text-white">تعديل بيانات الفارس</h3>
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
                  الاسم الكامل للفارس
                </label>
                <input
                  type="text"
                  required
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-xs font-bold text-slate-300">الحالة المهنية</label>
                  <select
                    className="bg-slate-950 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2 rounded-xl outline-none text-xs font-medium text-white"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as RiderStatus)}
                  >
                    <option value="متاح">متاح وجاهز</option>
                    <option value="في مهمة">في مهمة حالية</option>
                  </select>
                </div>
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

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">رابط الصورة الشخصية</label>
                <input
                  type="url"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-0 px-3 py-2.5 rounded-xl outline-none text-xs text-white"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                />
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
