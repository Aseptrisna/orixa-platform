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

  // Clear existing data and drop indexes
  console.log('🗑️  Clearing existing data and indexes...');
  
  const collections = ['users', 'companies', 'outlets', 'tables', 'categories', 'addons', 'menuitems', 'orders', 'payments', 'shifts', 'auditlogs', 'expenses'];
  
  for (const collName of collections) {
    try {
      await db.collection(collName).drop();
      console.log(`   Dropped collection: ${collName}`);
    } catch (e: any) {
      // Collection might not exist, ignore
      if (e.code !== 26) console.log(`   Skip: ${collName} (${e.message})`);
    }
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Create Super Admin
  console.log('👤 Creating super admin...');
  await db.collection('users').insertOne({
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
    name: 'Warung Makan Barokah',
    slug: 'warung-barokah',
    plan: 'PRO',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const companyId = companyResult.insertedId;

  // Create Outlet 1 - Pusat
  console.log('🏪 Creating outlet 1 (Pusat)...');
  const outlet1Result = await db.collection('outlets').insertOne({
    companyId,
    name: 'Cabang Pusat',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    phone: '021-5551234',
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
          accountName: 'Warung Makan Barokah',
          accountNumberOrVA: '1234567890',
          note: 'Transfer sesuai nominal, sertakan kode order di berita',
        },
        qrInstructions: {
          qrImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png',
          note: 'Scan QRIS dengan aplikasi e-wallet atau m-banking',
        },
      },
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const outlet1Id = outlet1Result.insertedId;

  // Create Outlet 2 - Cabang
  console.log('🏪 Creating outlet 2 (Cabang)...');
  const outlet2Result = await db.collection('outlets').insertOne({
    companyId,
    name: 'Cabang Kemang',
    address: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
    phone: '021-5559876',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    settings: {
      taxRate: 10,
      serviceRate: 0,
      rounding: 'NEAREST_500',
      orderMode: 'QR_AND_POS',
      paymentConfig: {
        enabledMethods: ['CASH', 'TRANSFER', 'QR'],
        transferInstructions: {
          bankName: 'Mandiri',
          accountName: 'Warung Makan Barokah',
          accountNumberOrVA: '0987654321',
          note: 'Transfer sesuai nominal pesanan',
        },
        qrInstructions: {
          qrImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png',
          note: 'Scan QRIS untuk pembayaran',
        },
      },
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const outlet2Id = outlet2Result.insertedId;

  // Create Company Admin
  console.log('👤 Creating company admin...');
  await db.collection('users').insertOne({
    name: 'Budi Santoso',
    email: 'admin@warung.co',
    passwordHash,
    role: 'COMPANY_ADMIN',
    companyId,
    outletIds: [outlet1Id, outlet2Id],
    phone: '081234567890',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create Cashier 1 - Outlet Pusat
  console.log('👤 Creating cashier 1...');
  await db.collection('users').insertOne({
    name: 'Siti Aminah',
    email: 'siti@warung.co',
    passwordHash,
    role: 'CASHIER',
    companyId,
    outletIds: [outlet1Id],
    phone: '081234567891',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create Cashier 2 - Outlet Kemang
  console.log('👤 Creating cashier 2...');
  await db.collection('users').insertOne({
    name: 'Ahmad Fauzi',
    email: 'ahmad@warung.co',
    passwordHash,
    role: 'CASHIER',
    companyId,
    outletIds: [outlet2Id],
    phone: '081234567892',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create Member
  console.log('👤 Creating member...');
  await db.collection('users').insertOne({
    name: 'Pelanggan Setia',
    email: 'member@warung.co',
    passwordHash,
    role: 'CUSTOMER_MEMBER',
    companyId,
    phone: '081234567893',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create Tables for Outlet 1 (5 tables)
  console.log('🪑 Creating tables for outlet 1...');
  for (let i = 1; i <= 5; i++) {
    await db.collection('tables').insertOne({
      companyId,
      outletId: outlet1Id,
      name: `Meja ${i}`,
      qrToken: `PUSAT${String(i).padStart(3, '0')}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Create Tables for Outlet 2 (5 tables)
  console.log('🪑 Creating tables for outlet 2...');
  for (let i = 1; i <= 5; i++) {
    await db.collection('tables').insertOne({
      companyId,
      outletId: outlet2Id,
      name: `Meja ${i}`,
      qrToken: `KEMANG${String(i).padStart(3, '0')}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Create 5 Categories
  console.log('📂 Creating categories...');
  const categoryData = [
    { name: 'Makanan Berat', sortOrder: 1 },
    { name: 'Makanan Ringan', sortOrder: 2 },
    { name: 'Minuman Dingin', sortOrder: 3 },
    { name: 'Minuman Panas', sortOrder: 4 },
    { name: 'Dessert', sortOrder: 5 },
  ];

  const categories1: any = {};
  const categories2: any = {};

  for (const cat of categoryData) {
    // Outlet 1
    const result1 = await db.collection('categories').insertOne({
      companyId,
      outletId: outlet1Id,
      name: cat.name,
      sortOrder: cat.sortOrder,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    categories1[cat.name] = result1.insertedId;

    // Outlet 2
    const result2 = await db.collection('categories').insertOne({
      companyId,
      outletId: outlet2Id,
      name: cat.name,
      sortOrder: cat.sortOrder,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    categories2[cat.name] = result2.insertedId;
  }

  // Create Addons
  console.log('➕ Creating addons...');
  const addonData = [
    { name: 'Extra Nasi', price: 5000 },
    { name: 'Extra Telur', price: 5000 },
    { name: 'Extra Keju', price: 7000 },
    { name: 'Extra Sambal', price: 3000 },
    { name: 'Topping Bubble', price: 5000 },
    { name: 'Topping Jelly', price: 5000 },
    { name: 'Whipped Cream', price: 5000 },
    { name: 'Extra Shot Espresso', price: 8000 },
  ];

  const addons1: any = {};
  const addons2: any = {};

  for (const addon of addonData) {
    const result1 = await db.collection('addons').insertOne({
      companyId,
      outletId: outlet1Id,
      name: addon.name,
      price: addon.price,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    addons1[addon.name] = result1.insertedId;

    const result2 = await db.collection('addons').insertOne({
      companyId,
      outletId: outlet2Id,
      name: addon.name,
      price: addon.price,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    addons2[addon.name] = result2.insertedId;
  }

  // Create 10 Menu Items for each outlet
  console.log('🍽️  Creating menu items...');
  const menuItemsData = [
    // Makanan Berat (4 items)
    {
      category: 'Makanan Berat',
      name: 'Nasi Goreng Spesial',
      description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
      basePrice: 25000,
      tags: ['Best Seller', 'Pedas'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 8000 },
      ],
      addons: ['Extra Nasi', 'Extra Telur', 'Extra Sambal'],
      stock: null,
      isAvailable: true,
    },
    {
      category: 'Makanan Berat',
      name: 'Mie Goreng Seafood',
      description: 'Mie goreng dengan udang, cumi, dan sayuran',
      basePrice: 30000,
      tags: ['Seafood'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 10000 },
      ],
      addons: ['Extra Telur'],
      stock: 50,
      isAvailable: true,
    },
    {
      category: 'Makanan Berat',
      name: 'Ayam Bakar Madu',
      description: 'Ayam bakar dengan bumbu madu dan sambal',
      basePrice: 35000,
      tags: ['Recommended'],
      variants: [
        { name: 'Paha', priceDelta: 0 },
        { name: 'Dada', priceDelta: 5000 },
      ],
      addons: ['Extra Nasi', 'Extra Sambal'],
      stock: 30,
      isAvailable: true,
    },
    {
      category: 'Makanan Berat',
      name: 'Soto Ayam Lamongan',
      description: 'Soto ayam khas Lamongan dengan koya',
      basePrice: 22000,
      tags: ['Tradisional'],
      variants: [],
      addons: ['Extra Nasi'],
      stock: null,
      isAvailable: true,
    },
    // Makanan Ringan (2 items)
    {
      category: 'Makanan Ringan',
      name: 'Kentang Goreng',
      description: 'French fries crispy dengan saus',
      basePrice: 18000,
      tags: ['Snack'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 7000 },
      ],
      addons: ['Extra Keju'],
      stock: 100,
      isAvailable: true,
    },
    {
      category: 'Makanan Ringan',
      name: 'Pisang Goreng Keju',
      description: 'Pisang goreng crispy dengan topping keju',
      basePrice: 15000,
      tags: ['Sweet'],
      variants: [],
      addons: ['Extra Keju', 'Whipped Cream'],
      stock: 40,
      isAvailable: true,
    },
    // Minuman Dingin (2 items)
    {
      category: 'Minuman Dingin',
      name: 'Es Teh Manis',
      description: 'Teh manis dingin segar',
      basePrice: 8000,
      tags: ['Fresh'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 3000 },
      ],
      addons: [],
      stock: null,
      isAvailable: true,
    },
    {
      category: 'Minuman Dingin',
      name: 'Thai Tea',
      description: 'Thai tea dengan susu kental manis',
      basePrice: 18000,
      tags: ['Popular'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Large', priceDelta: 5000 },
      ],
      addons: ['Topping Bubble', 'Topping Jelly'],
      stock: 60,
      isAvailable: true,
    },
    // Minuman Panas (1 item)
    {
      category: 'Minuman Panas',
      name: 'Kopi Susu Gula Aren',
      description: 'Espresso dengan susu dan gula aren',
      basePrice: 22000,
      tags: ['Caffeine', 'Popular'],
      variants: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Double Shot', priceDelta: 8000 },
      ],
      addons: ['Extra Shot Espresso', 'Whipped Cream'],
      stock: null,
      isAvailable: true,
    },
    // Dessert (1 item)
    {
      category: 'Dessert',
      name: 'Es Krim Sundae',
      description: 'Es krim vanilla dengan topping cokelat',
      basePrice: 20000,
      tags: ['Sweet', 'Cold'],
      variants: [
        { name: 'Single', priceDelta: 0 },
        { name: 'Double', priceDelta: 10000 },
      ],
      addons: ['Whipped Cream'],
      stock: 25,
      isAvailable: true,
    },
  ];

  // Insert for Outlet 1
  for (const item of menuItemsData) {
    await db.collection('menuitems').insertOne({
      companyId,
      outletId: outlet1Id,
      categoryId: categories1[item.category],
      name: item.name,
      description: item.description,
      imageUrl: null,
      basePrice: item.basePrice,
      isActive: true,
      isAvailable: item.isAvailable,
      stock: item.stock,
      tags: item.tags,
      variants: item.variants,
      addonIds: item.addons.map((a) => addons1[a]).filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Insert for Outlet 2
  for (const item of menuItemsData) {
    await db.collection('menuitems').insertOne({
      companyId,
      outletId: outlet2Id,
      categoryId: categories2[item.category],
      name: item.name,
      description: item.description,
      imageUrl: null,
      basePrice: item.basePrice,
      isActive: true,
      isAvailable: item.isAvailable,
      stock: item.stock,
      tags: item.tags,
      variants: item.variants,
      addonIds: item.addons.map((a) => addons2[a]).filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Create some sample expenses
  console.log('💰 Creating sample expenses...');
  const expenseCategories = ['BAHAN_BAKU', 'GAJI', 'LISTRIK', 'PERLENGKAPAN', 'LAINNYA'];
  const expenseDescriptions = [
    'Belanja bahan baku mingguan',
    'Gaji karyawan bulan ini',
    'Tagihan listrik',
    'Beli perlengkapan dapur',
    'Biaya operasional lainnya',
  ];

  for (let i = 0; i < 5; i++) {
    await db.collection('expenses').insertOne({
      companyId,
      outletId: i % 2 === 0 ? outlet1Id : outlet2Id,
      category: expenseCategories[i],
      description: expenseDescriptions[i],
      amount: Math.floor(Math.random() * 5000000) + 500000,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      note: '',
      receiptUrl: null,
      createdByUserId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log('');
  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 AKUN DEMO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('🔐 Super Admin:');
  console.log('   Email    : superadmin@orixa.dev');
  console.log('   Password : Password123!');
  console.log('');
  console.log('🏢 Company Admin (Warung Makan Barokah):');
  console.log('   Email    : admin@warung.co');
  console.log('   Password : Password123!');
  console.log('');
  console.log('💳 Kasir Cabang Pusat:');
  console.log('   Email    : siti@warung.co');
  console.log('   Password : Password123!');
  console.log('');
  console.log('💳 Kasir Cabang Kemang:');
  console.log('   Email    : ahmad@warung.co');
  console.log('   Password : Password123!');
  console.log('');
  console.log('👤 Member:');
  console.log('   Email    : member@warung.co');
  console.log('   Password : Password123!');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔗 QR TOKEN MEJA');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('Cabang Pusat  : PUSAT001, PUSAT002, PUSAT003, PUSAT004, PUSAT005');
  console.log('Cabang Kemang : KEMANG001, KEMANG002, KEMANG003, KEMANG004, KEMANG005');
  console.log('');
  console.log('Contoh URL    : http://localhost:5173/m/PUSAT001');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 DATA YANG DIBUAT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('• 1 Company     : Warung Makan Barokah');
  console.log('• 2 Outlets     : Cabang Pusat, Cabang Kemang');
  console.log('• 10 Meja       : 5 per outlet');
  console.log('• 5 Kategori    : Makanan Berat, Makanan Ringan, Minuman Dingin, Minuman Panas, Dessert');
  console.log('• 20 Menu       : 10 per outlet');
  console.log('• 16 Addons     : 8 per outlet');
  console.log('• 5 Pengeluaran : Sample expenses');
  console.log('• 5 Users       : 1 Super Admin, 1 Admin, 2 Kasir, 1 Member');
  console.log('');

  await disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
