import { z } from 'zod';
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
} from './enums';

// ============================================
// COMMON SCHEMAS
// ============================================
export const mongoIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

// ============================================
// AUTH SCHEMAS
// ============================================
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  adminName: z.string().min(2, 'Admin name must be at least 2 characters').max(100),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const memberRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  companyId: mongoIdSchema.optional(),
  qrToken: z.string().optional(),
});

// ============================================
// USER SCHEMAS
// ============================================
export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
  companyId: mongoIdSchema.optional(),
  outletIds: z.array(mongoIdSchema).optional(),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  outletIds: z.array(mongoIdSchema).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// COMPANY SCHEMAS
// ============================================
export const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  plan: z.nativeEnum(CompanyPlan).default(CompanyPlan.FREE),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  plan: z.nativeEnum(CompanyPlan).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// PAYMENT CONFIG SCHEMAS
// ============================================
export const transferInstructionsSchema = z.object({
  bankName: z.string().min(1).max(100),
  accountName: z.string().min(1).max(100),
  accountNumberOrVA: z.string().min(1).max(50),
  note: z.string().max(500).optional(),
});

export const qrInstructionsSchema = z.object({
  qrImageUrl: z.string().url(),
  note: z.string().max(500).optional(),
});

export const paymentConfigSchema = z.object({
  enabledMethods: z.array(z.nativeEnum(PaymentMethod)).min(1),
  transferInstructions: transferInstructionsSchema.optional(),
  qrInstructions: qrInstructionsSchema.optional(),
});

// ============================================
// OUTLET SCHEMAS
// ============================================
export const outletSettingsSchema = z.object({
  taxRate: z.number().min(0).max(100).default(0),
  serviceRate: z.number().min(0).max(100).default(0),
  rounding: z.nativeEnum(RoundingMode).default(RoundingMode.NONE),
  orderMode: z.nativeEnum(OrderMode).default(OrderMode.QR_AND_POS),
  paymentConfig: paymentConfigSchema,
});

export const createOutletSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  timezone: z.string().default('Asia/Jakarta'),
  currency: z.string().default('IDR'),
  settings: outletSettingsSchema.optional(),
});

export const updateOutletSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  settings: outletSettingsSchema.partial().optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// TABLE SCHEMAS
// ============================================
export const createTableSchema = z.object({
  outletId: mongoIdSchema,
  name: z.string().min(1).max(50),
});

export const updateTableSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// CATEGORY SCHEMAS
// ============================================
export const createCategorySchema = z.object({
  outletId: mongoIdSchema,
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// ADDON SCHEMAS
// ============================================
export const createAddonSchema = z.object({
  outletId: mongoIdSchema,
  name: z.string().min(1).max(100),
  price: z.number().min(0),
});

export const updateAddonSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// MENU ITEM SCHEMAS
// ============================================
export const menuItemVariantSchema = z.object({
  name: z.string().min(1).max(50),
  priceDelta: z.number(),
});

export const createMenuItemSchema = z.object({
  outletId: mongoIdSchema,
  categoryId: mongoIdSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  basePrice: z.number().min(0),
  tags: z.array(z.string()).optional(),
  variants: z.array(menuItemVariantSchema).optional(),
  addonIds: z.array(mongoIdSchema).optional(),
});

export const updateMenuItemSchema = z.object({
  categoryId: mongoIdSchema.optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  basePrice: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(menuItemVariantSchema).optional(),
  addonIds: z.array(mongoIdSchema).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// ORDER SCHEMAS
// ============================================
export const orderItemSchema = z.object({
  menuItemId: mongoIdSchema,
  qty: z.number().int().min(1),
  variantName: z.string().optional(),
  addonIds: z.array(mongoIdSchema).optional(),
  note: z.string().max(500).optional(),
});

export const orderCustomerSchema = z.object({
  type: z.nativeEnum(CustomerType),
  memberUserId: mongoIdSchema.optional(),
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

// Guest checkout (public)
export const createPublicOrderSchema = z.object({
  outletId: mongoIdSchema,
  tableId: mongoIdSchema.optional(),
  qrToken: z.string().optional(),
  customer: z.object({
    name: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
  }).optional(),
  items: z.array(orderItemSchema).min(1),
  note: z.string().max(500).optional(),
});

// POS order (cashier)
export const createPosOrderSchema = z.object({
  outletId: mongoIdSchema,
  tableId: mongoIdSchema.optional(),
  customer: orderCustomerSchema.optional(),
  items: z.array(orderItemSchema).min(1),
  discount: z.number().min(0).default(0),
  note: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// ============================================
// PAYMENT SCHEMAS
// ============================================
export const createPaymentSchema = z.object({
  orderId: mongoIdSchema,
  method: z.nativeEnum(PaymentMethod),
  amount: z.number().min(0),
  proofUrl: z.string().url().optional(),
  note: z.string().max(500).optional(),
});

export const confirmPaymentSchema = z.object({
  note: z.string().max(500).optional(),
});

export const rejectPaymentSchema = z.object({
  note: z.string().max(500).optional(),
});

// ============================================
// SHIFT SCHEMAS
// ============================================
export const openShiftSchema = z.object({
  outletId: mongoIdSchema,
  openingCash: z.number().min(0),
  note: z.string().max(500).optional(),
});

export const closeShiftSchema = z.object({
  closingCash: z.number().min(0),
  note: z.string().max(500).optional(),
});

// ============================================
// REPORT SCHEMAS
// ============================================
export const dailyReportSchema = z.object({
  outletId: mongoIdSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const rangeReportSchema = z.object({
  outletId: mongoIdSchema,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ============================================
// TYPE EXPORTS FROM SCHEMAS
// ============================================
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type MemberRegisterInput = z.infer<typeof memberRegisterSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateOutletInput = z.infer<typeof createOutletSchema>;
export type UpdateOutletInput = z.infer<typeof updateOutletSchema>;
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateAddonInput = z.infer<typeof createAddonSchema>;
export type UpdateAddonInput = z.infer<typeof updateAddonSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type CreatePublicOrderInput = z.infer<typeof createPublicOrderSchema>;
export type CreatePosOrderInput = z.infer<typeof createPosOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type OpenShiftInput = z.infer<typeof openShiftSchema>;
export type CloseShiftInput = z.infer<typeof closeShiftSchema>;
export type DailyReportInput = z.infer<typeof dailyReportSchema>;
export type RangeReportInput = z.infer<typeof rangeReportSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
