import React, { useState, useRef } from 'react';
import { User, Palette, Check, ShieldAlert, Upload, Sparkles, Scale, Hash, Database, Trash2 } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface AdminProfileViewProps {
  ownerName: string;
  onUpdateOwnerName: (name: string) => void;
  appName: string;
  onUpdateAppName: (name: string) => void;
  ownerPicture: string;
  onUpdateOwnerPicture: (picUrl: string) => void;
  appTheme: 'cosmic' | 'royal';
  onUpdateAppTheme: (theme: 'cosmic' | 'royal') => void;
  ownedQuantityKg: number;
  onUpdateOwnedQuantityKg: (qty: number) => void;
  ownedCount: number;
  onUpdateOwnedCount: (count: number) => void;
}

const THEMES = [
  {
    id: 'cosmic' as const,
    name: 'المظهر الداكن الكوني (Dark Theme)',
    desc: 'مظهر ليلي متقدم بألوان كحلية وبنفسجية داكنة وجذابة',
    primaryColor: '#6366f1',
    secondaryColor: '#a855f7',
    previewBg: 'from-slate-900 to-indigo-950',
    themeType: 'داكن'
  },
  {
    id: 'royal' as const,
    name: 'المظهر التراثي الدافئ (Warm Cream)',
    desc: 'مزيج كلاسيكي دافئ مائل للصفرة المريحة للأنظار والعمل الطويل',
    primaryColor: '#ea580c',
    secondaryColor: '#b45309',
    previewBg: 'from-amber-50 to-orange-50',
    themeType: 'دافئ ملون'
  }
];

export default function AdminProfileView({
  ownerName,
  onUpdateOwnerName,
  appName,
  onUpdateAppName,
  ownerPicture,
  onUpdateOwnerPicture,
  appTheme,
  onUpdateAppTheme,
  ownedQuantityKg,
  onUpdateOwnedQuantityKg,
  ownedCount,
  onUpdateOwnedCount
}: AdminProfileViewProps) {
  const [nameInput, setNameInput] = useState(ownerName);
  const [appInput, setAppInput] = useState(appName);
  const [qtyInput, setQtyInput] = useState<number | ''>(ownedQuantityKg);
  const [countInput, setCountInput] = useState<number | ''>(ownedCount);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Custom Firebase configuration states
  const [dbApiKey, setDbApiKey] = useState('');
  const [dbAuthDomain, setDbAuthDomain] = useState('');
  const [dbProjectId, setDbProjectId] = useState('');
  const [dbDatabaseId, setDbDatabaseId] = useState('');
  const [dbStorageBucket, setDbStorageBucket] = useState('');
  const [dbMessagingSenderId, setDbMessagingSenderId] = useState('');
  const [dbAppId, setDbAppId] = useState('');
  const [isUsingCustomFirebase, setIsUsingCustomFirebase] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('custom_firebase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDbApiKey(parsed.apiKey || '');
        setDbAuthDomain(parsed.authDomain || '');
        setDbProjectId(parsed.projectId || '');
        setDbDatabaseId(parsed.firestoreDatabaseId || '');
        setDbStorageBucket(parsed.storageBucket || '');
        setDbMessagingSenderId(parsed.messagingSenderId || '');
        setDbAppId(parsed.appId || '');
        setIsUsingCustomFirebase(true);
      }
    } catch (e) {
      console.error('Failed to load custom firebase settings', e);
    }
  }, []);

  const handleSaveCustomFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbApiKey || !dbProjectId || !dbAppId) {
      alert('يرجى ملء الحقول الأساسية على الأقل: API Key, Project ID, App ID');
      return;
    }
    const config = {
      apiKey: dbApiKey.trim(),
      authDomain: dbAuthDomain.trim() || `${dbProjectId.trim()}.firebaseapp.com`,
      projectId: dbProjectId.trim(),
      firestoreDatabaseId: dbDatabaseId.trim() || '(default)',
      storageBucket: dbStorageBucket.trim() || `${dbProjectId.trim()}.appspot.com`,
      messagingSenderId: dbMessagingSenderId.trim(),
      appId: dbAppId.trim(),
    };
    localStorage.setItem('custom_firebase_config', JSON.stringify(config));
    triggerToast('تم حفظ إعدادات Firebase المخصصة! جاري إعادة تشغيل التطبيق للاتصال بالخادم الجديد...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleClearCustomFirebase = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف الاتصال المخصص والعودة لقاعدة بيانات الساندبوكس الافتراضية؟')) {
      localStorage.removeItem('custom_firebase_config');
      triggerToast('تمت العودة لقاعدة البيانات الافتراضية. جاري إعادة تحميل الصفحة...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  React.useEffect(() => {
    setNameInput(ownerName);
  }, [ownerName]);

  React.useEffect(() => {
    setAppInput(appName);
  }, [appName]);

  React.useEffect(() => {
    setQtyInput(ownedQuantityKg);
  }, [ownedQuantityKg]);

  React.useEffect(() => {
    setCountInput(ownedCount);
  }, [ownedCount]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOwnerName(nameInput);
    onUpdateAppName(appInput);
    triggerToast('تم حفظ تعديلات معلومات الهوية والجمعية بنجاح!');
  };

  const handleSaveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOwnedQuantityKg(qtyInput === '' ? 0 : Number(qtyInput));
    onUpdateOwnedCount(countInput === '' ? 0 : Number(countInput));
    triggerToast('تم تحديث كميات المخزون المتوفر بنجاح!');
  };

  // Handle local image file upload, compress, and update
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WEBP)');
      return;
    }
    
    try {
      const compressedBase64 = await compressImage(file, 300, 300, 0.7);
      onUpdateOwnerPicture(compressedBase64);
      triggerToast('تم تحميل وتعيين الصورة الشخصية الجديدة بنجاح!');
    } catch (err) {
      console.error('Error compressing profile image:', err);
      alert('حدث خطأ أثناء معالجة وضغط الصورة.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-right pb-10 max-w-4xl mx-auto" dir="rtl">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-24 right-5 bg-emerald-500 text-white font-bold text-xs px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 border border-white/20 animate-scale-up">
          <Check size={16} strokeWidth={3} className="bg-white/20 rounded-full p-0.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div>
        <h2 className="text-2xl font-bold font-headline text-white flex items-center gap-2 justify-start">
          <Palette size={24} className="text-indigo-400" />
          الملف الشخصي وإعدادات المظهر
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          قم بتحديث هويتك الشخصية، اسم الجمعية، وتحميل صورتك الخاصة، مع التبديل الفوري بين المظهر الداكن والمضيء.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Core Profile Info */}
        <div className="glass-card p-6 border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <User size={18} className="text-indigo-400" />
            معلومات الهوية والجمعية
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">اسم المالك / المدير</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الشيخ أحمد الهلالي"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">اسم التطبيق / الجمعية</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جمعية الفرسان الأصيلة"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-500"
                  value={appInput}
                  onChange={(e) => setAppInput(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 btn-gradient text-white font-bold text-xs rounded-full cursor-pointer transition-opacity"
              >
                حفظ التعديلات الأساسية
              </button>
            </div>
          </form>
        </div>

        {/* Section 1.5: Inventory Management (What the Admin owns) */}
        <div className="glass-card p-6 border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Scale size={18} className="text-indigo-400" />
            إدارة المخزون والكبسول (ما تملكه الجمعية)
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            أدخل إجمالي كمية البارود والكبسول المتوفر الذي تملكه الجمعية حالياً لتتبع الكميات المتبقية والصافية تلقائياً بعد خصم متطلبات العروض النشطة.
          </p>

          <form onSubmit={handleSaveInventory} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">إجمالي كمية البارود المتوفرة (كغ)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="مثال: 150.5"
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-500 text-left"
                    dir="ltr"
                    value={qtyInput}
                    onChange={(e) => setQtyInput(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">كغ</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">إجمالي كمية الكبسول المتوفرة (حبة/وحدة)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="مثال: 100"
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-500 text-left"
                    dir="ltr"
                    value={countInput}
                    onChange={(e) => setCountInput(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">حبة</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 btn-gradient text-white font-bold text-xs rounded-full cursor-pointer transition-opacity"
              >
                تحديث كميات المخزون المتوفر
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Upload Profile Picture ONLY (No presets) */}
        <div className="glass-card p-6 border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Upload size={18} className="text-indigo-400" />
            تغيير الصورة الشخصية (تحميل ملف صورة)
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* Left part: Current Profile Picture Avatar */}
            <div className="relative shrink-0 flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 overflow-hidden shadow-xl bg-slate-800">
                <img
                  className="w-full h-full object-cover"
                  src={ownerPicture || undefined}
                  alt="Current Avatar"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQr_DnDfoEvvlXDUFBo-0YHL31Z6qrYy0LcR9z1oThmVqrgOJzb-hfZ23dGNxpFfqlv8AEn4bygqeBVGu8e6fg5clr9A1oojBMWUB9efVDasB9D30GiT_NdICG54dZdoufsH6OoGWXiNVt458HFxsyYxFr-i-8hvsT7saTwjyRQWBPYxNN3l-yVXtAja4p3fmYIPPW4ZIDksWW9FwUffHzZjia-eZWaGyIdqE84MR06s8EOm6ekfJN1Eyl9FoT9-d2CFoYrZRn3hM';
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">الصورة الحالية</span>
            </div>

            {/* Right part: Drag & Drop upload area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 w-full min-h-[120px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                  : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Upload size={32} className="text-indigo-400 mb-2.5 animate-bounce" />
              <p className="text-xs font-bold text-white mb-1">
                اسحب صورتك الشخصية وأفلتها هنا، أو اضغط للتصفح من جهازك
              </p>
              <p className="text-[10px] text-slate-500">
                يدعم صيغ PNG, JPG, JPEG, WEBP (الحد الأقصى 2.5 ميجابايت)
              </p>
            </div>

          </div>
        </div>

        {/* Section 3: App Theme Selector (Dark/Light/Warm Cream options) */}
        <div className="glass-card p-6 border border-white/10 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Palette size={18} className="text-indigo-400" />
              تغيير مظهر التطبيق (من الداكن إلى المضيء)
            </h3>
            <span className="text-[10px] bg-white/5 border border-white/10 px-2 rounded-full py-1 text-slate-400 font-bold">
              تغيير المظهر بالكامل
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {THEMES.map((theme) => {
              const isSelected = appTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onUpdateAppTheme(theme.id)}
                  className={`p-5 rounded-2xl border text-right transition-all duration-300 cursor-pointer relative flex flex-col justify-between space-y-4 group h-40 ${
                    isSelected
                      ? 'border-indigo-500 bg-white/[0.05] shadow-[0_0_25px_rgba(99,102,241,0.08)]'
                      : 'border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <div>
                    {/* Header: Theme Name & Bullet Selection */}
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                        <Sparkles size={14} className="text-indigo-400" />
                        {theme.name}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20'
                        }`}
                      >
                        {isSelected && <Check size={8} strokeWidth={4} />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">{theme.desc}</p>
                  </div>

                  {/* Visual indicators */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-2 w-full text-[10px]">
                    <span className="text-slate-400 font-semibold bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                      نوع المظهر: {theme.themeType}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/10 shadow-sm"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/10 shadow-sm"
                        style={{ backgroundColor: theme.secondaryColor }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Custom Firebase Database Credentials */}
        <div className="glass-card p-6 border border-white/10 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database size={18} className="text-indigo-400" />
              ربط مشروع Firebase الخاص بك (للعمل على Netlify أو الاستضافة الخارجية)
            </h3>
            {isUsingCustomFirebase ? (
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 rounded-full py-1 text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                متصل بمشروعك الخاص
              </span>
            ) : (
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 px-2 rounded-full py-1 text-amber-400 font-bold">
                متصل بقاعدة البيانات المشتركة
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            هل ترغب في ربط التطبيق بقاعدة البيانات ومشروع Firebase الخاص بك مباشرة (مثل مشروعك <strong className="text-white">"oulad soltan app"</strong>)؟
            أدخل إعدادات مشروع Firebase الخاص بك بالأسفل. سيتم تخزين هذه الإعدادات محلياً في متصفحك وسيستخدمها التطبيق لتخزين كل الحجوزات والمخزون في قاعدة بياناتك الخاصة بدلاً من الساندبوكس المشترك.
          </p>

          <form onSubmit={handleSaveCustomFirebase} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">API Key (مطلوب)</label>
                <input
                  type="text"
                  required
                  placeholder="AIzaSy..."
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-600 text-left"
                  dir="ltr"
                  value={dbApiKey}
                  onChange={(e) => setDbApiKey(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Project ID (مطلوب)</label>
                <input
                  type="text"
                  required
                  placeholder="oulad-soltan-app"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-600 text-left"
                  dir="ltr"
                  value={dbProjectId}
                  onChange={(e) => setDbProjectId(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">App ID (مطلوب)</label>
                <input
                  type="text"
                  required
                  placeholder="1:1234567890:web:abcd..."
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-600 text-left"
                  dir="ltr"
                  value={dbAppId}
                  onChange={(e) => setDbAppId(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Auth Domain (اختياري)</label>
                <input
                  type="text"
                  placeholder="oulad-soltan-app.firebaseapp.com"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-600 text-left"
                  dir="ltr"
                  value={dbAuthDomain}
                  onChange={(e) => setDbAuthDomain(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Firestore Database ID (اختياري)</label>
                <input
                  type="text"
                  placeholder="(default)"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-600 text-left"
                  dir="ltr"
                  value={dbDatabaseId}
                  onChange={(e) => setDbDatabaseId(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Storage Bucket (اختياري)</label>
                <input
                  type="text"
                  placeholder="oulad-soltan-app.appspot.com"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-600 text-left"
                  dir="ltr"
                  value={dbStorageBucket}
                  onChange={(e) => setDbStorageBucket(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300">Messaging Sender ID (اختياري)</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  className="bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 rounded-xl outline-none text-xs text-white placeholder-slate-600 text-left"
                  dir="ltr"
                  value={dbMessagingSenderId}
                  onChange={(e) => setDbMessagingSenderId(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              {isUsingCustomFirebase ? (
                <button
                  type="button"
                  onClick={handleClearCustomFirebase}
                  className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-full cursor-pointer flex items-center gap-1.5 transition-all border border-rose-500/10"
                >
                  <Trash2 size={14} />
                  <span>حذف الاتصال المخصص والعودة للوضع الافتراضي</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="px-6 py-2.5 btn-gradient text-white font-bold text-xs rounded-full cursor-pointer transition-opacity"
              >
                تنشيط وحفظ اتصال Firebase الجديد
              </button>
            </div>
          </form>
        </div>

        {/* Info advice card */}
        <div className="glass-card p-4 border border-white/10 flex items-start gap-3 text-xs bg-slate-900/10">
          <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white">إشعار الحفظ المحلي الآمن</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              جميع تغييرات الملف الشخصي وصورة الأفاتار المُحمّلة تظل مخزنة بالكامل محلياً وبشكل خاص على جهازك ومتصفحك الحالي، دون استهلاك موارد الخادم.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
