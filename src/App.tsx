import { useState, useEffect, FormEvent } from 'react';
import { Booking, Rider, NavigationTab, BookingStatus, UserRole, AppNotification } from './types';
import { ALGERIAN_WILAYAS } from './data/seedData';
import ClientBookingView from './components/ClientBookingView';
import LoginView from './components/LoginView';
import AdminBookingsView from './components/AdminBookingsView';
import AdminRidersView from './components/AdminRidersView';
import AdminCalendarView from './components/AdminCalendarView';
import AdminStatsView from './components/AdminStatsView';
import AdminProfileView from './components/AdminProfileView';
import RiderDashboardView from './components/RiderDashboardView';
import Sidebar from './components/Sidebar';
import BottomNavBar from './components/BottomNavBar';
import NotificationBell from './components/NotificationBell';
import { LogOut, Plus, X, Menu, Calendar, Users, MapPin, Phone, UserCheck, Sparkles } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

export default function App() {
  // 1. Core Persistent State
  const [riders, setRiders] = useState<Rider[]>(() => {
    const saved = localStorage.getItem('gac_riders');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('gac_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Owner settings persistent states
  const [ownerName, setOwnerName] = useState<string>(() => {
    return localStorage.getItem('gac_owner_name') || 'مدير الجمعية';
  });

  const [appName, setAppName] = useState<string>(() => {
    return localStorage.getItem('gac_app_name') || 'GAC';
  });

  const [ownerPicture, setOwnerPicture] = useState<string>(() => {
    return localStorage.getItem('gac_owner_picture') || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQr_DnDfoEvvlXDUFBo-0YHL31Z6qrYy0LcR9z1oThmVqrgOJzb-hfZ23dGNxpFfqlv8AEn4bygqeBVGu8e6fg5clr9A1oojBMWUB9efVDasB9D30GiT_NdICG54dZdoufsH6OoGWXiNVt458HFxsyYxFr-i-8hvsT7saTwjyRQWBPYxNN3l-yVXtAja4p3fmYIPPW4ZIDksWW9FwUffHzZjia-eZWaGyIdqE84MR06s8EOm6ekfJN1Eyl9FoT9-d2CFoYrZRn3hM';
  });

  const [appTheme, setAppTheme] = useState<'cosmic' | 'royal'>(() => {
    const saved = localStorage.getItem('gac_theme');
    return saved === 'royal' ? 'royal' : 'cosmic';
  });

  const [ownedQuantityKg, setOwnedQuantityKg] = useState<number>(() => {
    const val = localStorage.getItem('gac_owned_quantity_kg');
    return val ? Number(val) : 100; // default to a friendly initial 100
  });

  const [ownedCount, setOwnedCount] = useState<number>(() => {
    const val = localStorage.getItem('gac_owned_count');
    return val ? Number(val) : 50; // default to a friendly initial 50
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
  const [qbPhoneError, setQbPhoneError] = useState('');
  const [qbDate, setQbDate] = useState('');
  const [qbWilaya, setQbWilaya] = useState(ALGERIAN_WILAYAS[0]);
  const [qbRidersCount, setQbRidersCount] = useState(2);
  const [qbStartPoint, setQbStartPoint] = useState('');
  const [qbEndPoint, setQbEndPoint] = useState('');
  const [qbQuantityKg, setQbQuantityKg] = useState<number | ''>('');
  const [qbCount, setQbCount] = useState<number | ''>('');

  // Real-time synchronization with Firestore
  useEffect(() => {
    const ridersCol = collection(db, 'riders');
    const unsubscribe = onSnapshot(
      ridersCol,
      (snapshot) => {
        const list: Rider[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Rider);
        });
        setRiders(list);
        localStorage.setItem('gac_riders', JSON.stringify(list));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'riders');
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const bookingsCol = collection(db, 'bookings');
    const unsubscribe = onSnapshot(
      bookingsCol,
      (snapshot) => {
        const list: Booking[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Booking);
        });
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setBookings(list);
        localStorage.setItem('gac_bookings', JSON.stringify(list));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const notificationsCol = collection(db, 'notifications');
    const unsubscribe = onSnapshot(
      notificationsCol,
      (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as AppNotification);
        });
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setNotifications(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const settingsDoc = doc(db, 'settings', 'app');
    const unsubscribe = onSnapshot(
      settingsDoc,
      async (docSnap) => {
        if (!docSnap.exists()) {
          console.log('Seeding initial settings to Firestore...');
          try {
            await setDoc(settingsDoc, {
              ownerName: 'مدير الجمعية',
              appName: 'GAC',
              ownerPicture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQr_DnDfoEvvlXDUFBo-0YHL31Z6qrYy0LcR9z1oThmVqrgOJzb-hfZ23dGNxpFfqlv8AEn4bygqeBVGu8e6fg5clr9A1oojBMWUB9efVDasB9D30GiT_NdICG54dZdoufsH6OoGWXiNVt458HFxsyYxFr-i-8hvsT7saTwjyRQWBPYxNN3l-yVXtAja4p3fmYIPPW4ZIDksWW9FwUffHzZjia-eZWaGyIdqE84MR06s8EOm6ekfJN1Eyl9FoT9-d2CFoYrZRn3hM',
              ownedQuantityKg: 100,
              ownedCount: 50,
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'settings/app');
          }
        } else {
          const data = docSnap.data();
          if (data.ownerName) {
            setOwnerName(data.ownerName);
            localStorage.setItem('gac_owner_name', data.ownerName);
          }
          if (data.appName) {
            setAppName(data.appName);
            localStorage.setItem('gac_app_name', data.appName);
          }
          if (data.ownerPicture) {
            setOwnerPicture(data.ownerPicture);
            localStorage.setItem('gac_owner_picture', data.ownerPicture);
          }
          if (data.ownedQuantityKg !== undefined) {
            setOwnedQuantityKg(data.ownedQuantityKg);
            localStorage.setItem('gac_owned_quantity_kg', String(data.ownedQuantityKg));
          }
          if (data.ownedCount !== undefined) {
            setOwnedCount(data.ownedCount);
            localStorage.setItem('gac_owned_count', String(data.ownedCount));
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/app');
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem('gac_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('gac_session');
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('gac_theme', appTheme);
  }, [appTheme]);

  // Theme styling effect to update CSS variables and class lists dynamically
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-warm');

    if (appTheme === 'cosmic') {
      root.classList.add('theme-dark');
      root.style.setProperty('--theme-primary', '#6366f1');
      root.style.setProperty('--theme-secondary', '#a855f7');
      root.style.setProperty('--theme-bg', '#020617');
      root.style.setProperty('--theme-glow-1', 'rgba(99, 102, 241, 0.15)');
      root.style.setProperty('--theme-glow-2', 'rgba(168, 85, 247, 0.12)');
      root.style.setProperty('--theme-glow-3', 'rgba(14, 165, 233, 0.12)');
    } else if (appTheme === 'royal') {
      root.classList.add('theme-warm');
      root.style.setProperty('--theme-primary', '#ea580c');
      root.style.setProperty('--theme-secondary', '#b45309');
      root.style.setProperty('--theme-bg', '#faf7f2');
      root.style.setProperty('--theme-glow-1', 'rgba(234, 88, 12, 0.08)');
      root.style.setProperty('--theme-glow-2', 'rgba(180, 83, 9, 0.06)');
      root.style.setProperty('--theme-glow-3', 'rgba(217, 119, 6, 0.06)');
    }
  }, [appTheme]);

  // 5. Database / State Operations (using Firestore)
  const handleAddBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'assignedRiders' | 'createdAt'> & { assignedRiders?: string[] }) => {
    const id = `booking_${Date.now()}`;
    const cleanData: any = {};
    Object.keys(bookingData).forEach((key) => {
      const val = (bookingData as any)[key];
      if (val !== undefined && val !== null) {
        cleanData[key] = val;
      }
    });

    const newBooking: Booking = {
      ...cleanData,
      id,
      status: 'قيد الانتظار',
      assignedRiders: cleanData.assignedRiders || [],
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'bookings', id), newBooking);

      // Create a notification for the Admin
      const notifId = `notif_${Date.now()}`;
      const newNotification: AppNotification = {
        id: notifId,
        title: 'حجز جديد قيد الانتظار',
        message: `قام الزبون ${newBooking.customerName} بطلب حجز جديد في ولاية ${newBooking.wilaya} بتاريخ ${newBooking.date}.`,
        type: 'new_booking',
        isRead: false,
        createdAt: new Date().toISOString(),
        bookingId: id,
      };
      await setDoc(doc(db, 'notifications', notifId), newNotification);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${id}`);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleUpdateBooking = async (id: string, updatedData: Partial<Booking>) => {
    try {
      const cleanData: any = {};
      Object.keys(updatedData).forEach((key) => {
        const val = (updatedData as any)[key];
        if (val !== undefined && val !== null) {
          cleanData[key] = val;
        }
      });
      await updateDoc(doc(db, 'bookings', id), cleanData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleAssignRiders = async (bookingId: string, riderIds: string[]) => {
    try {
      let currentBooking = bookings.find((b) => b.id === bookingId);
      if (!currentBooking) {
        const docSnap = await getDoc(doc(db, 'bookings', bookingId));
        if (docSnap.exists()) {
          currentBooking = docSnap.data() as Booking;
        }
      }

      const previouslyAssigned = currentBooking && Array.isArray(currentBooking.assignedRiders)
        ? currentBooking.assignedRiders
        : [];

      await updateDoc(doc(db, 'bookings', bookingId), { assignedRiders: riderIds });

      // Find riders that were newly added
      const newlyAssigned = riderIds.filter(id => !previouslyAssigned.includes(id));
      
      if (newlyAssigned.length > 0 && currentBooking) {
        for (const riderId of newlyAssigned) {
          const rider = riders.find(r => r.id === riderId);
          if (rider) {
            const notifId = `notif_${Date.now()}_${riderId}`;
            const newNotification: AppNotification = {
              id: notifId,
              title: 'تم تعيينك في عرض جديد',
              message: `لقد تم تعيينك للمشاركة في عرض الزبون ${currentBooking.customerName} في ولاية ${currentBooking.wilaya} بتاريخ ${currentBooking.date}.`,
              type: 'rider_assignment',
              targetUserId: riderId,
              isRead: false,
              createdAt: new Date().toISOString(),
              bookingId: bookingId,
            };
            await setDoc(doc(db, 'notifications', notifId), newNotification);
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `bookings/${id}`);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const userRole = session?.role || 'rider';
      const targetRiderId = session?.role === 'rider' ? session.riderId : undefined;
      
      const filtered = notifications.filter((n) => {
        if (userRole === 'admin') {
          return !n.targetUserId || n.targetUserId === 'admin';
        } else {
          return n.targetUserId === targetRiderId;
        }
      });

      await Promise.all(
        filtered.map((n) => deleteDoc(doc(db, 'notifications', n.id)))
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'notifications');
    }
  };

  const handleAddRider = async (riderData: Omit<Rider, 'id'>) => {
    const id = `rider_${Date.now()}`;
    const newRider: Rider = {
      ...riderData,
      id,
    };
    try {
      await setDoc(doc(db, 'riders', id), newRider);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `riders/${id}`);
    }
  };

  const handleUpdateRider = async (id: string, updatedData: Partial<Rider>) => {
    try {
      await updateDoc(doc(db, 'riders', id), updatedData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `riders/${id}`);
    }
  };

  const handleDeleteRider = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'riders', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `riders/${id}`);
    }
  };

  const handleUpdateOwnerName = async (name: string) => {
    setOwnerName(name);
    try {
      await setDoc(doc(db, 'settings', 'app'), { ownerName: name }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/app');
    }
  };

  const handleUpdateAppName = async (name: string) => {
    setAppName(name);
    try {
      await setDoc(doc(db, 'settings', 'app'), { appName: name }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/app');
    }
  };

  const handleUpdateOwnerPicture = async (picUrl: string) => {
    setOwnerPicture(picUrl);
    try {
      await setDoc(doc(db, 'settings', 'app'), { ownerPicture: picUrl }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/app');
    }
  };

  const handleUpdateOwnedQuantityKg = async (qty: number) => {
    setOwnedQuantityKg(qty);
    localStorage.setItem('gac_owned_quantity_kg', String(qty));
    try {
      await setDoc(doc(db, 'settings', 'app'), { ownedQuantityKg: qty }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/app');
    }
  };

  const handleUpdateOwnedCount = async (count: number) => {
    setOwnedCount(count);
    localStorage.setItem('gac_owned_count', String(count));
    try {
      await setDoc(doc(db, 'settings', 'app'), { ownedCount: count }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/app');
    }
  };

  const handleLoginSuccess = (userSession: typeof session) => {
    setSession(userSession);
    setShowLogin(false);
    setActiveTab('bookings');
  };

  const handleLogout = () => {
    setSession(null);
    setShowLogin(false);
  };

  // Quick booking submit
  const handleQuickBookingSubmit = (e: FormEvent) => {
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

    handleAddBooking({
      customerName: qbName,
      phone: cleanPhone,
      date: qbDate,
      wilaya: qbWilaya,
      ridersCount: qbRidersCount,
      startPoint: qbStartPoint,
      endPoint: qbEndPoint,
      createdBy: 'الإدارة',
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
          riders={riders}
          onLogout={handleLogout}
          appName={appName}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearNotifications={handleClearNotifications}
          onAddBooking={handleAddBooking}
          onUpdateBooking={handleUpdateBooking}
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
        appName={appName}
      />
    );
  }

  // Render Client booking form if session is null and login is not active
  if (!session) {
    return (
      <ClientBookingView
        onAddBooking={(data) => handleAddBooking({ ...data, createdBy: 'الزبون' })}
        onNavigateToLogin={() => setShowLogin(true)}
        appName={appName}
      />
    );
  }

  // Render Main Admin Panel (session.role === 'admin')
  return (
    <div className="min-h-screen text-right font-sans lg:mr-80 pb-32 bg-[var(--theme-bg)] text-[var(--text-main)] relative overflow-hidden animate-fade-in transition-colors duration-300" dir="rtl">
      {/* Decorative background glows */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Panel Top Header Bar */}
      <header className="flex flex-row justify-between items-center w-full px-5 lg:px-10 h-16 z-30 bg-slate-900/40 backdrop-blur-md border-b border-white/10 sticky top-0 relative">
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 hover:bg-white/5 p-1 px-2.5 rounded-xl transition-all cursor-pointer group text-right"
          title="عرض وتعديل الملف الشخصي"
        >
          <div className="text-right">
            <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">{ownerName}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span>لوحة التحكم</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white/20 group-hover:border-indigo-400 transition-all bg-slate-800 overflow-hidden shrink-0">
            <img
              className="w-full h-full object-cover"
              src={ownerPicture || undefined}
              alt="Manager Avatar"
              referrerPolicy="no-referrer"
            />
          </div>
        </button>

        <h1 className="text-2xl font-bold text-white font-headline tracking-wider">{appName}</h1>

        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            onMarkAsRead={handleMarkNotificationRead}
            onClear={handleClearNotifications}
            currentUserRole="admin"
          />
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar Navigation (Right-pinned) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
        ownerName={ownerName}
        appName={appName}
        ownerPicture={ownerPicture}
      />

      {/* Main Admin Contents Layout */}
      <main className="px-5 lg:px-10 py-8 max-w-7xl mx-auto relative">
        
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
              onUpdateBooking={handleUpdateBooking}
              onAssignRiders={handleAssignRiders}
              onDeleteBooking={handleDeleteBooking}
              ownedQuantityKg={ownedQuantityKg}
              ownedCount={ownedCount}
            />
          </div>
        )}

        {activeTab === 'riders' && (
          <AdminRidersView
            riders={riders}
            bookings={bookings}
            onAddRider={handleAddRider}
            onUpdateRider={handleUpdateRider}
            onDeleteRider={handleDeleteRider}
          />
        )}

        {activeTab === 'calendar' && (
          <AdminCalendarView
            bookings={bookings}
            riders={riders}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateBooking={handleUpdateBooking}
            onAssignRiders={handleAssignRiders}
            onDeleteBooking={handleDeleteBooking}
          />
        )}

        {activeTab === 'stats' && (
          <AdminStatsView
            bookings={bookings}
            riders={riders}
            ownedQuantityKg={ownedQuantityKg}
            ownedCount={ownedCount}
            onUpdateOwnedQuantityKg={handleUpdateOwnedQuantityKg}
            onUpdateOwnedCount={handleUpdateOwnedCount}
          />
        )}

        {activeTab === 'profile' && (
          <AdminProfileView
            ownerName={ownerName}
            onUpdateOwnerName={handleUpdateOwnerName}
            appName={appName}
            onUpdateAppName={handleUpdateAppName}
            ownerPicture={ownerPicture}
            onUpdateOwnerPicture={handleUpdateOwnerPicture}
            appTheme={appTheme}
            onUpdateAppTheme={setAppTheme}
            ownedQuantityKg={ownedQuantityKg}
            onUpdateOwnedQuantityKg={handleUpdateOwnedQuantityKg}
            ownedCount={ownedCount}
            onUpdateOwnedCount={handleUpdateOwnedCount}
          />
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
