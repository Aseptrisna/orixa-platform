import {
  Role,
  CompanyPlan,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderChannel,
  CustomerType,
  OrderMode,
  RoundingMode,
  AuditAction,
  EntityType,
} from './enums';

// ============================================
// BASE TYPES
// ============================================
export interface BaseDocument {
  _id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================
// USER
// ============================================
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  companyId?: string;
  outletIds?: string[];
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface IUserPublic {
  _id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string;
  outletIds?: string[];
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
}

// ============================================
// COMPANY
// ============================================
export interface ICompany extends BaseDocument {
  name: string;
  slug: string;
  plan: CompanyPlan;
  isActive: boolean;
}

// ============================================
// TRANSFER INSTRUCTIONS
// ============================================
export interface ITransferInstructions {
  bankName: string;
  accountName: string;
  accountNumberOrVA: string;
  note?: string;
}

// ============================================
// QR INSTRUCTIONS
// ============================================
export interface IQrInstructions {
  qrImageUrl: string;
  note?: string;
}

// ============================================
// PAYMENT CONFIG
// ============================================
export interface IPaymentConfig {
  enabledMethods: PaymentMethod[];
  transferInstructions?: ITransferInstructions;
  qrInstructions?: IQrInstructions;
}

// ============================================
// OUTLET SETTINGS
// ============================================
export interface IOutletSettings {
  taxRate: number;
  serviceRate: number;
  rounding: RoundingMode;
  orderMode: OrderMode;
  paymentConfig: IPaymentConfig;
}

// ============================================
// OUTLET
// ============================================
export interface IOutlet extends BaseDocument {
  companyId: string;
  name: string;
  address?: string;
  phone?: string;
  timezone: string;
  currency: string;
  settings: IOutletSettings;
  isActive: boolean;
}

// ============================================
// TABLE
// ============================================
export interface ITable extends BaseDocument {
  companyId: string;
  outletId: string;
  name: string;
  qrToken: string;
  isActive: boolean;
}

// ============================================
// CATEGORY
// ============================================
export interface ICategory extends BaseDocument {
  companyId: string;
  outletId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

// ============================================
// ADDON
// ============================================
export interface IAddon extends BaseDocument {
  companyId: string;
  outletId: string;
  name: string;
  price: number;
  isActive: boolean;
}

// ============================================
// MENU ITEM VARIANT
// ============================================
export interface IMenuItemVariant {
  name: string;
  priceDelta: number;
}

// ============================================
// MENU ITEM
// ============================================
export interface IMenuItem extends BaseDocument {
  companyId: string;
  outletId: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  isActive: boolean;
  isAvailable?: boolean; // true = available, false = sold out
  stock?: number | null; // null = unlimited, number = tracked stock
  tags?: string[];
  variants?: IMenuItemVariant[];
  addonIds?: string[];
}

// ============================================
// ORDER ITEM SNAPSHOT
// ============================================
export interface IOrderItemAddonSnapshot {
  addonId: string;
  name: string;
  price: number;
}

export interface IOrderItemVariantSnapshot {
  name: string;
  priceDelta: number;
}

export interface IOrderItem {
  menuItemId: string;
  nameSnapshot: string;
  qty: number;
  basePriceSnapshot: number;
  variantSnapshot?: IOrderItemVariantSnapshot;
  addonsSnapshot?: IOrderItemAddonSnapshot[];
  note?: string;
  lineTotal: number;
}

// ============================================
// ORDER CUSTOMER
// ============================================
export interface IOrderCustomer {
  type: CustomerType;
  memberUserId?: string;
  name?: string;
  phone?: string;
}

// ============================================
// ORDER
// ============================================
export interface IOrder extends BaseDocument {
  companyId: string;
  outletId: string;
  tableId?: string;
  sessionId?: string;
  channel: OrderChannel;
  customer: IOrderCustomer;
  orderCode: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  service: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdByUserId?: string;
  note?: string;
}

// ============================================
// PAYMENT
// ============================================
export interface IPayment extends BaseDocument {
  companyId: string;
  outletId: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  proofUrl?: string;
  note?: string;
  confirmedByUserId?: string;
}

// ============================================
// SHIFT
// ============================================
export interface IShift extends BaseDocument {
  companyId: string;
  outletId: string;
  cashierUserId: string;
  openedAt: Date | string;
  closedAt?: Date | string;
  openingCash: number;
  closingCash?: number;
  note?: string;
}

// ============================================
// AUDIT LOG
// ============================================
export interface IAuditLog extends BaseDocument {
  actorUserId?: string;
  companyId?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  detail?: Record<string, unknown>;
}

// ============================================
// QR RESOLVE RESPONSE
// ============================================
export interface IQrResolveResponse {
  company: Pick<ICompany, '_id' | 'name' | 'slug'>;
  outlet: IOutlet;
  table?: Pick<ITable, '_id' | 'name' | 'qrToken'>;
}

// ============================================
// AUTH TYPES
// ============================================
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  user: IUserPublic;
}

export interface IRegisterCompanyRequest {
  companyName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface IRefreshResponse {
  accessToken: string;
}

export interface ITokenPayload {
  sub: string;
  email: string;
  role: Role;
  companyId?: string;
  outletIds?: string[];
}

// ============================================
// PAGINATION
// ============================================
export interface IPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// REPORT TYPES
// ============================================
export interface IDailyReportQuery {
  outletId: string;
  date: string; // YYYY-MM-DD
}

export interface IRangeReportQuery {
  outletId: string;
  startDate: string;
  endDate: string;
}

export interface IReportSummary {
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  totalService: number;
  totalDiscount: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentStatus: Record<PaymentStatus, number>;
  ordersByPaymentMethod: Record<PaymentMethod, number>;
  topItems: Array<{
    menuItemId: string;
    name: string;
    qty: number;
    revenue: number;
  }>;
}
