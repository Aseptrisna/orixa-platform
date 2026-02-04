import { PaymentMethod, OrderStatus, PaymentStatus, Role, CompanyPlan, RoundingMode, OrderMode } from './enums';

// ============================================
// DEFAULT VALUES
// ============================================
export const DEFAULT_CURRENCY = 'IDR';
export const DEFAULT_TIMEZONE = 'Asia/Jakarta';
export const DEFAULT_TAX_RATE = 10; // 10%
export const DEFAULT_SERVICE_RATE = 5; // 5%

// ============================================
// PAGINATION
// ============================================
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ============================================
// TOKEN EXPIRY
// ============================================
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';

// ============================================
// PAYMENT METHOD LABELS
// ============================================
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Tunai',
  [PaymentMethod.TRANSFER]: 'Transfer Bank / VA',
  [PaymentMethod.QR]: 'QRIS / QR Payment',
};

// ============================================
// ORDER STATUS LABELS
// ============================================
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: 'Pesanan Baru',
  [OrderStatus.ACCEPTED]: 'Diterima',
  [OrderStatus.IN_PROGRESS]: 'Sedang Diproses',
  [OrderStatus.READY]: 'Siap',
  [OrderStatus.SERVED]: 'Telah Disajikan',
  [OrderStatus.CANCELLED]: 'Dibatalkan',
  [OrderStatus.CLOSED]: 'Selesai',
};

// ============================================
// PAYMENT STATUS LABELS
// ============================================
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'Belum Bayar',
  [PaymentStatus.PENDING]: 'Menunggu Konfirmasi',
  [PaymentStatus.PAID]: 'Lunas',
  [PaymentStatus.REJECTED]: 'Ditolak',
  [PaymentStatus.REFUNDED]: 'Dikembalikan',
};

// ============================================
// ROLE LABELS
// ============================================
export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.COMPANY_ADMIN]: 'Admin Perusahaan',
  [Role.CASHIER]: 'Kasir',
  [Role.CUSTOMER_MEMBER]: 'Member',
  [Role.CUSTOMER_GUEST]: 'Tamu',
};

// ============================================
// PLAN LABELS
// ============================================
export const PLAN_LABELS: Record<CompanyPlan, string> = {
  [CompanyPlan.FREE]: 'Gratis',
  [CompanyPlan.TRIAL]: 'Trial',
  [CompanyPlan.PRO]: 'Pro',
  [CompanyPlan.ENTERPRISE]: 'Enterprise',
};

// ============================================
// ROUNDING MODE LABELS
// ============================================
export const ROUNDING_MODE_LABELS: Record<RoundingMode, string> = {
  [RoundingMode.NONE]: 'Tanpa Pembulatan',
  [RoundingMode.NEAREST_100]: 'Ke 100 Terdekat',
  [RoundingMode.NEAREST_500]: 'Ke 500 Terdekat',
  [RoundingMode.NEAREST_1000]: 'Ke 1000 Terdekat',
};

// ============================================
// ORDER MODE LABELS
// ============================================
export const ORDER_MODE_LABELS: Record<OrderMode, string> = {
  [OrderMode.QR_AND_POS]: 'QR Menu + POS',
  [OrderMode.POS_ONLY]: 'Hanya POS',
  [OrderMode.QR_ONLY]: 'Hanya QR Menu',
};

// ============================================
// STATUS COLORS (Tailwind classes)
// ============================================
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: 'bg-blue-100 text-blue-800',
  [OrderStatus.ACCEPTED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.READY]: 'bg-green-100 text-green-800',
  [OrderStatus.SERVED]: 'bg-emerald-100 text-emerald-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.CLOSED]: 'bg-gray-100 text-gray-800',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'bg-red-100 text-red-800',
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-800',
  [PaymentStatus.REJECTED]: 'bg-red-100 text-red-800',
  [PaymentStatus.REFUNDED]: 'bg-purple-100 text-purple-800',
};

// ============================================
// ORDER STATUS FLOW (valid transitions)
// ============================================
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.SERVED, OrderStatus.CANCELLED],
  [OrderStatus.SERVED]: [OrderStatus.CLOSED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.CLOSED]: [],
};

// ============================================
// KDS STATUS FILTER
// ============================================
export const KDS_ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.ACCEPTED,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
];

// ============================================
// API ROUTES
// ============================================
export const API_ROUTES = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER_COMPANY: '/auth/register-company',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  
  // Member auth
  MEMBER_REGISTER: '/member/register',
  MEMBER_LOGIN: '/member/login',
  
  // SuperAdmin
  SA_COMPANIES: '/sa/companies',
  SA_AUDIT: '/sa/audit',
  
  // Company
  COMPANY_ME: '/companies/me',
  
  // Outlets
  OUTLETS: '/outlets',
  
  // Tables
  TABLES: '/tables',
  
  // Categories
  CATEGORIES: '/categories',
  
  // Addons
  ADDONS: '/addons',
  
  // Menu Items
  MENU_ITEMS: '/menu-items',
  
  // Users
  USERS: '/users',
  
  // Reports
  REPORTS_DAILY: '/reports/daily',
  REPORTS_RANGE: '/reports/range',
  
  // Public
  PUBLIC_RESOLVE: '/public/resolve',
  PUBLIC_MENU: '/public/menu',
  PUBLIC_ORDERS: '/public/orders',
  PUBLIC_PAYMENTS: '/public/payments',
  
  // POS
  POS_ORDERS: '/pos/orders',
  POS_PAYMENTS: '/pos/payments',
  POS_SHIFTS: '/pos/shifts',
  
  // KDS
  KDS_ORDERS: '/kds/orders',
} as const;

// ============================================
// SOCKET ROOMS
// ============================================
export const getStaffRoom = (companyId: string, outletId: string) => 
  `staff:${companyId}:${outletId}`;

export const getCustomerRoom = (orderId: string) => 
  `customer:${orderId}`;
