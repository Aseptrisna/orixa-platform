import { connect, disconnect } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/orixa';

async function seed() {
  console.log('🌱 Starting seed...');
  console.log(`📦 Connecting to ${MONGODB_URI}`);

  const conn = await connect(MONGODB_URI);
  const db = conn.connection.db;

  if (!db) {
    throw new Error('Database connection failed');
  }

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await db.collection('users').deleteMany({});
  await db.collection('companies').deleteMany({});
  await db.collection('outlets').deleteMany({});
  await db.collection('tables').deleteMany({});
  await db.collection('categories').deleteMany({});
  await db.collection('addons').deleteMany({});
  await db.collection('menuitems').deleteMany({});
  await db.collection('orders').deleteMany({});
  await db.collection('payments').deleteMany({});
  await db.collection('shifts').deleteMany({});
  await db.collection('auditlogs').deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Create Super Admin
  console.log('👤 Creating super admin...');
  const superAdminResult = await db.collection('users').insertOne({
    name: 'Super Admin',
    email: 'superadmin@orixa.dev',
    passwordHash,
    role: 'SUPER_ADMIN',
    companyId: null,
    outletIds: [],
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create Demo Company
  console.log('🏢 Creating demo company...');
  const companyResult = await db.collection('companies').insertOne({
    name: 'Demo Restaurant',
    slug: 'demo-restaurant',
    plan: 'PRO',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const companyId = companyResult.insertedId;

  // Create Demo Outlet
  console.log('🏪 Creating demo outlet...');
  const outletResult = await db.collection('outlets').insertOne({
    companyId,
    name: 'Outlet Pusat',
    address: 'Jl. Contoh No. 123, Jakarta',
    phone: '021-1234567',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    settings: {
      taxRate: 10,
      serviceRate: 5,
      rounding: 'NEAREST_100',
      orderMode: 'QR_AND_POS',
      paymentConfig: {
        enabledMethods: ['CASH', 'TRANSFER', 'QR'],
        transferInstructions: {
          bankName: 'BCA',
          accountName: 'PT Demo Restaurant',
          accountNumberOrVA: '1234567890',
          note: 'Mohon transfer sesuai nominal pesanan',
        },
        qrInstructions: {
          qrImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png',
          note: 'Scan QR QRIS untuk pembayaran',
        },
      },
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const outletId = outletResult.insertedId;

  // Create Company Admin
  console.log('👤 Creating company admin...');
  await db.collection('users').insertOne({
    name: 'Admin Demo',
    email: 'admin@demo.co',
    passwordHash,
    role: 'COMPANY_ADMIN',
    companyId,
    outletIds: [outletId],
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create Cashier
  console.log('👤 Creating cashier...');
  await db.collection('users').insertOne({
    name: 'Kasir Demo',
    email: 'cashier@demo.co',
    passwordHash,
    role: 'CASHIER',
    companyId,
    outletIds: [outletId],
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create Member
  console.log('👤 Creating member...');
  await db.collection('users').insertOne({
    name: 'Member Demo',
    email: 'member@demo.co',
    passwordHash,
    role: 'CUSTOMER_MEMBER',
    companyId,
    phone: '08123456789',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create Tables
  console.log('🪑 Creating tables...');
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    const result = await db.collection('tables').insertOne({
      companyId,
      outletId,
      name: `Meja ${i}`,
      qrToken: `TABLE${String(i).padStart(3, '0')}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    tables.push(result.insertedId);
  }

  // Create Categories
  console.log('📂 Creating categories...');
  const categories: any = {};
  const categoryData = [
    { name: 'Makanan', sortOrder: 1 },
    { name: 'Minuman', sortOrder: 2 },
    { name: 'Snack', sortOrder: 3 },
    { name: 'Dessert', sortOrder: 4 },
  ];

  for (const cat of categoryData) {
    const result = await db.collection('categories').insertOne({
      companyId,
      outletId,
      name: cat.name,
      sortOrder: cat.sortOrder,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    categories[cat.name] = result.insertedId;
  }

  // Create Addons
  console.log('➕ Creating addons...');
  const addons: any = {};
  const addonData = [
    { name: 'Extra Nasi', price: 5000 },
    { name: 'Extra Telur', price: 5000 },
    { name: 'Extra Keju', price: 7000 },
    { name: 'Extra Sambal', price: 3000 },
    { name: 'Topping Bubble', price: 5000 },
    { name: 'Topping Jelly', price: 5000 },
  ];

  for (const addon of addonData) {
    const result = await db.collection('addons').insertOne({
      companyId,
      outletId,
      name: addon.name,
      price: addon.price,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    addons[addon.name] = result.insertedId;
  }

  // Create Menu Items
  console.log('🍽️  Creating menu items...');
  const menuItems = [
    {
      categoryId: categories['Makanan'],
      name: 'Nasi Goreng Spesial',
      description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
      basePrice: 25000,
      tags: ['Best Seller', 'Pedas'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 8000 },
      ],
      addonIds: [addons['Extra Nasi'], addons['Extra Telur'], addons['Extra Sambal']],
    },
    {
      categoryId: categories['Makanan'],
      name: 'Mie Goreng Seafood',
      description: 'Mie goreng dengan udang, cumi, dan sayuran',
      basePrice: 30000,
      tags: ['Seafood'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 10000 },
      ],
      addonIds: [addons['Extra Telur']],
    },
    {
      categoryId: categories['Makanan'],
      name: 'Ayam Bakar',
      description: 'Ayam bakar dengan bumbu kecap dan sambal',
      basePrice: 35000,
      tags: ['Recommended'],
      variants: [
        { name: 'Paha', priceDelta: 0 },
        { name: 'Dada', priceDelta: 5000 },
      ],
      addonIds: [addons['Extra Nasi'], addons['Extra Sambal']],
    },
    {
      categoryId: categories['Makanan'],
      name: 'Sate Ayam',
      description: '10 tusuk sate ayam dengan bumbu kacang',
      basePrice: 28000,
      tags: ['Best Seller'],
      variants: [],
      addonIds: [addons['Extra Nasi']],
    },
    {
      categoryId: categories['Minuman'],
      name: 'Es Teh Manis',
      description: 'Teh manis dingin segar',
      basePrice: 8000,
      tags: [],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 3000 },
      ],
      addonIds: [],
    },
    {
      categoryId: categories['Minuman'],
      name: 'Es Jeruk',
      description: 'Jeruk peras segar dengan es',
      basePrice: 12000,
      tags: ['Fresh'],
      variants: [],
      addonIds: [],
    },
    {
      categoryId: categories['Minuman'],
      name: 'Thai Tea',
      description: 'Thai tea dengan susu',
      basePrice: 18000,
      tags: ['Popular'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 5000 },
      ],
      addonIds: [addons['Topping Bubble'], addons['Topping Jelly']],
    },
    {
      categoryId: categories['Minuman'],
      name: 'Kopi Susu',
      description: 'Espresso dengan susu segar',
      basePrice: 20000,
      tags: ['Caffeine'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 5000 },
      ],
      addonIds: [],
    },
    {
      categoryId: categories['Snack'],
      name: 'Kentang Goreng',
      description: 'French fries crispy',
      basePrice: 15000,
      tags: [],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 7000 },
      ],
      addonIds: [addons['Extra Keju']],
    },
    {
      categoryId: categories['Snack'],
      name: 'Pisang Goreng',
      description: 'Pisang goreng crispy dengan topping',
      basePrice: 12000,
      tags: [],
      variants: [],
      addonIds: [addons['Extra Keju']],
    },
    {
      categoryId: categories['Dessert'],
      name: 'Es Krim Vanilla',
      description: '2 scoop es krim vanilla premium',
      basePrice: 20000,
      tags: ['Sweet'],
      variants: [],
      addonIds: [],
    },
    {
      categoryId: categories['Dessert'],
      name: 'Brownies',
      description: 'Chocolate brownies homemade',
      basePrice: 18000,
      tags: ['Sweet'],
      variants: [],
      addonIds: [],
    },
  ];

  for (const item of menuItems) {
    await db.collection('menuitems').insertOne({
      companyId,
      outletId,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      imageUrl: null,
      basePrice: item.basePrice,
      isActive: true,
      tags: item.tags,
      variants: item.variants,
      addonIds: item.addonIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📋 Demo Accounts:');
  console.log('   Super Admin: superadmin@orixa.dev / Password123!');
  console.log('   Company Admin: admin@demo.co / Password123!');
  console.log('   Cashier: cashier@demo.co / Password123!');
  console.log('   Member: member@demo.co / Password123!');
  console.log('');
  console.log('🔗 QR Token for Table 1: TABLE001');
  console.log('');

  await disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
