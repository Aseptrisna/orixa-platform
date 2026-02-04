// ============================================
// ROLE ENUMS
// ============================================
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  CASHIER = 'CASHIER',
  CUSTOMER_MEMBER = 'CUSTOMER_MEMBER',
  CUSTOMER_GUEST = 'CUSTOMER_GUEST',
}

// ============================================
// PERMISSION ENUMS
// ============================================
export enum Permission {
  // Company
  COMPANY_READ = 'company:read',
  COMPANY_WRITE = 'company:write',
  
  // Outlet
  OUTLET_READ = 'outlet:read',
  OUTLET_WRITE = 'outlet:write',
  
  // Menu
  MENU_READ = 'menu:read',
  MENU_WRITE = 'menu:write',
  
  // Order
  ORDER_READ = 'order:read',
  ORDER_WRITE = 'order:write',
  
  // Payment
  PAYMENT_READ = 'payment:read',
  PAYMENT_WRITE = 'payment:write',
  
  // Report
  REPORT_READ = 'report:read',
  
  // User
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  
  // Table
  TABLE_READ = 'table:read',
  TABLE_WRITE = 'table:write',
  
  // Expense
  EXPENSE_READ = 'expense:read',
  EXPENSE_WRITE = 'expense:write',
  
  // SuperAdmin only
  SA_COMPANIES = 'sa:companies',
  SA_AUDIT = 'sa:audit',
}

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    Permission.SA_COMPANIES,
    Permission.SA_AUDIT,
    Permission.COMPANY_READ,
    Permission.COMPANY_WRITE,
    Permission.OUTLET_READ,
    Permission.OUTLET_WRITE,
    Permission.MENU_READ,
    Permission.MENU_WRITE,
    Permission.ORDER_READ,
    Permission.ORDER_WRITE,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_WRITE,
    Permission.REPORT_READ,
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.TABLE_READ,
    Permission.TABLE_WRITE,
    Permission.EXPENSE_READ,
    Permission.EXPENSE_WRITE,
  ],
  [Role.COMPANY_ADMIN]: [
    Permission.COMPANY_READ,
    Permission.COMPANY_WRITE,
    Permission.OUTLET_READ,
    Permission.OUTLET_WRITE,
    Permission.MENU_READ,
    Permission.MENU_WRITE,
    Permission.ORDER_READ,
    Permission.ORDER_WRITE,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_WRITE,
    Permission.REPORT_READ,
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.TABLE_READ,
    Permission.TABLE_WRITE,
    Permission.EXPENSE_READ,
    Permission.EXPENSE_WRITE,
  ],
  [Role.CASHIER]: [
    Permission.OUTLET_READ,
    Permission.MENU_READ,
    Permission.ORDER_READ,
    Permission.ORDER_WRITE,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_WRITE,
    Permission.TABLE_READ,
  ],
  [Role.CUSTOMER_MEMBER]: [
    Permission.MENU_READ,
    Permission.ORDER_READ,
    Permission.ORDER_WRITE,
  ],
  [Role.CUSTOMER_GUEST]: [
    Permission.MENU_READ,
  ],
};

// ============================================
// COMPANY PLAN
// ============================================
export enum CompanyPlan {
  FREE = 'FREE',
  TRIAL = 'TRIAL',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

// ============================================
// ORDER STATUS
// ============================================
export enum OrderStatus {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

// ============================================
// PAYMENT STATUS
// ============================================
export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

// ============================================
// PAYMENT METHOD
// ============================================
export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  QR = 'QR',
}

// ============================================
// ORDER CHANNEL
// ============================================
export enum OrderChannel {
  QR = 'QR',
  POS = 'POS',
}

// ============================================
// CUSTOMER TYPE
// ============================================
export enum CustomerType {
  GUEST = 'GUEST',
  MEMBER = 'MEMBER',
}

// ============================================
// ORDER MODE
// ============================================
export enum OrderMode {
  QR_AND_POS = 'QR_AND_POS',
  POS_ONLY = 'POS_ONLY',
  QR_ONLY = 'QR_ONLY',
}

// ============================================
// ROUNDING MODE
// ============================================
export enum RoundingMode {
  NONE = 'NONE',
  NEAREST_100 = 'NEAREST_100',
  NEAREST_500 = 'NEAREST_500',
  NEAREST_1000 = 'NEAREST_1000',
}

// ============================================
// AUDIT ACTION
// ============================================
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  STATUS_CHANGE = 'STATUS_CHANGE',
  PAYMENT_CONFIRM = 'PAYMENT_CONFIRM',
  PAYMENT_REJECT = 'PAYMENT_REJECT',
  SHIFT_OPEN = 'SHIFT_OPEN',
  SHIFT_CLOSE = 'SHIFT_CLOSE',
}

// ============================================
// ENTITY TYPE
// ============================================
export enum EntityType {
  USER = 'USER',
  COMPANY = 'COMPANY',
  OUTLET = 'OUTLET',
  TABLE = 'TABLE',
  CATEGORY = 'CATEGORY',
  ADDON = 'ADDON',
  MENU_ITEM = 'MENU_ITEM',
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  SHIFT = 'SHIFT',
}

// ============================================
// SOCKET EVENTS
// ============================================
export enum SocketEvent {
  // Order events
  ORDER_CREATED = 'order.created',
  ORDER_STATUS_UPDATED = 'order.status.updated',
  
  // Payment events
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_UPDATED = 'payment.updated',
  
  // Connection events
  JOIN_STAFF_ROOM = 'join.staff.room',
  JOIN_CUSTOMER_ROOM = 'join.customer.room',
  LEAVE_ROOM = 'leave.room',
}

// ============================================
// EXPENSE CATEGORY
// ============================================
export enum ExpenseCategory {
  BAHAN_BAKU = 'BAHAN_BAKU',       // Raw materials
  GAJI = 'GAJI',                   // Salary
  LISTRIK = 'LISTRIK',             // Electricity
  AIR = 'AIR',                     // Water
  SEWA = 'SEWA',                   // Rent
  TRANSPORT = 'TRANSPORT',         // Transportation
  PERLENGKAPAN = 'PERLENGKAPAN',   // Supplies
  MAINTENANCE = 'MAINTENANCE',     // Maintenance
  MARKETING = 'MARKETING',         // Marketing
  LAINNYA = 'LAINNYA',             // Others
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.BAHAN_BAKU]: 'Bahan Baku',
  [ExpenseCategory.GAJI]: 'Gaji Karyawan',
  [ExpenseCategory.LISTRIK]: 'Listrik',
  [ExpenseCategory.AIR]: 'Air',
  [ExpenseCategory.SEWA]: 'Sewa',
  [ExpenseCategory.TRANSPORT]: 'Transportasi',
  [ExpenseCategory.PERLENGKAPAN]: 'Perlengkapan',
  [ExpenseCategory.MAINTENANCE]: 'Perawatan',
  [ExpenseCategory.MARKETING]: 'Marketing',
  [ExpenseCategory.LAINNYA]: 'Lainnya',
};
