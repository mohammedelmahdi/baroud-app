export type RiderType = 'بارود' | 'خيال';
export type RiderStatus = 'متاح' | 'في مهمة';

export interface Rider {
  id: string;
  name: string;
  type: RiderType;
  username: string;
  password?: string;
  status: RiderStatus;
  image: string;
}

export type BookingStatus = 'قيد الانتظار' | 'مؤكد' | 'مكتمل' | 'ملغى';

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  wilaya: string;
  ridersCount: number;
  startPoint: string;
  endPoint: string;
  status: BookingStatus;
  assignedRiders: string[]; // List of Rider IDs assigned to this booking
  createdAt: string;
}

export type UserRole = 'admin' | 'rider';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  riderId?: string; // Links to a Rider if role is 'rider'
  image: string;
}

export type NavigationTab = 'bookings' | 'riders' | 'calendar' | 'stats' | 'client-booking' | 'profile';
