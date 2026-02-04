import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  QrCode, 
  CreditCard, 
  BarChart3, 
  Users, 
  Zap,
  Check,
  ArrowRight,
  ChefHat,
  Smartphone,
  Monitor,
  ClipboardList,
  Receipt,
  TrendingUp,
  ShoppingCart,
  UserCheck,
  Bell,
  Package
} from 'lucide-react';

const features = [
  {
    icon: Store,
    title: 'Multi-Outlet',
    description: 'Kelola banyak outlet dalam satu dashboard',
  },
  {
    icon: QrCode,
    title: 'QR Menu',
    description: 'Pelanggan scan QR untuk lihat menu dan pesan langsung',
  },
  {
    icon: CreditCard,
    title: 'Payment Flexible',
    description: 'Cash, Transfer, atau QRIS - sesuai kebutuhan',
  },
  {
    icon: BarChart3,
    title: 'Laporan Realtime',
    description: 'Pantau penjualan dan performa bisnis secara real-time',
  },
  {
    icon: Users,
    title: 'Multi-Role',
    description: 'Admin, Kasir, dan Customer dengan akses berbeda',
  },
  {
    icon: Zap,
    title: 'Kitchen Display',
    description: 'KDS untuk dapur dengan update status realtime',
  },
];

const howItWorks = [
  {
    step: 1,
    icon: Store,
    title: 'Daftar & Setup',
    description: 'Daftar akun bisnis, buat outlet, dan setup menu produk Anda dalam hitungan menit.',
    color: 'bg-blue-500',
  },
  {
    step: 2,
    icon: QrCode,
    title: 'Generate QR Meja',
    description: 'Buat QR code unik untuk setiap meja. Cetak dan tempel di meja pelanggan.',
    color: 'bg-purple-500',
  },
  {
    step: 3,
    icon: Smartphone,
    title: 'Pelanggan Scan & Pesan',
    description: 'Pelanggan scan QR, lihat menu lengkap dengan gambar & harga, lalu pesan langsung tanpa antri.',
    color: 'bg-green-500',
  },
  {
    step: 4,
    icon: Monitor,
    title: 'Kasir Konfirmasi',
    description: 'Kasir menerima notifikasi pesanan, konfirmasi pembayaran (Cash/Transfer/QRIS).',
    color: 'bg-orange-500',
  },
  {
    step: 5,
    icon: ChefHat,
    title: 'Dapur Proses',
    description: 'Kitchen Display System (KDS) menampilkan pesanan. Dapur update status: Diproses → Siap.',
    color: 'bg-red-500',
  },
  {
    step: 6,
    icon: Bell,
    title: 'Pelanggan Notif',
    description: 'Pelanggan dapat tracking status pesanan realtime di HP mereka.',
    color: 'bg-teal-500',
  },
];

const userRoles = [
  {
    role: 'Admin/Owner',
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-600',
    capabilities: [
      'Dashboard analitik penjualan',
      'Kelola outlet, menu, dan harga',
      'Atur staff dan permission',
      'Laporan keuangan & pengeluaran',
      'Export data ke Excel',
    ],
  },
  {
    role: 'Kasir',
    icon: Monitor,
    color: 'from-blue-500 to-cyan-600',
    capabilities: [
      'POS untuk input pesanan manual',
      'Konfirmasi pembayaran QR order',
      'Cetak struk/nota',
      'Buka/tutup shift kasir',
      'Update stok menu',
    ],
  },
  {
    role: 'Dapur/Barista',
    icon: ChefHat,
    color: 'from-orange-500 to-red-600',
    capabilities: [
      'Kitchen Display System (KDS)',
      'Lihat pesanan masuk realtime',
      'Update status: Diproses → Siap',
      'Filter berdasarkan station',
      'Cetak checklist pesanan',
    ],
  },
  {
    role: 'Pelanggan',
    icon: Smartphone,
    color: 'from-green-500 to-emerald-600',
    capabilities: [
      'Scan QR untuk lihat menu',
      'Pesan tanpa perlu login',
      'Pilih metode pembayaran',
      'Track status pesanan',
      'Riwayat order (jika login)',
    ],
  },
];

const pricing = [
  {
    name: 'Free',
    price: 'Gratis',
    description: 'Untuk memulai',
    features: ['1 Outlet', '100 Transaksi/bulan', 'QR Menu', 'Laporan dasar'],
  },
  {
    name: 'Pro',
    price: 'Rp 299.000',
    period: '/bulan',
    description: 'Untuk bisnis berkembang',
    features: ['5 Outlet', 'Unlimited transaksi', 'QR Menu + POS', 'Laporan lengkap', 'KDS', 'Priority support'],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Untuk skala besar',
    features: ['Unlimited outlet', 'Custom features', 'Dedicated support', 'SLA guarantee', 'On-premise option'],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ORIXA
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Fitur</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Cara Kerja</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Harga</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="shadow-lg shadow-primary/25">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Platform POS #1 untuk UMKM Indonesia
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary to-blue-600 bg-clip-text text-transparent leading-tight">
              Kelola Bisnis Lebih Mudah & Modern
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Dari restoran hingga retail — satu platform untuk <span className="text-primary font-semibold">QR Menu</span>, <span className="text-primary font-semibold">POS Kasir</span>, dan <span className="text-primary font-semibold">Kitchen Display</span>. Setup dalam 5 menit!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all">
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/m/TABLE001">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2">
                  <QrCode className="mr-2 h-5 w-5" />
                  Coba Demo QR Menu
                </Button>
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Tanpa kartu kredit
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Setup 5 menit
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Support 24/7
              </div>
            </div>
          </div>
          
          {/* Hero Image/Mockup */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 shadow-2xl">
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="h-8 bg-gray-100 flex items-center gap-2 px-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-[300px] flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
                        <QrCode className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                        <p className="text-xs font-medium text-gray-600">QR Menu</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
                        <Monitor className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-xs font-medium text-gray-600">POS Kasir</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
                        <ChefHat className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                        <p className="text-xs font-medium text-gray-600">KDS Dapur</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Lengkap untuk Bisnis Anda</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola operasional bisnis dalam satu platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Kerja ORIXA</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Alur sederhana dari pendaftaran hingga pesanan sampai ke pelanggan
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group">
                {/* Step number badge */}
                <div className={`absolute -top-3 -left-3 w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                  {item.step}
                </div>
                
                <div className="pt-4">
                  <div className={`w-14 h-14 rounded-2xl ${item.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-7 w-7 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Untuk Siapa ORIXA?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Setiap role punya akses dan fitur yang berbeda sesuai kebutuhan
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userRoles.map((role) => (
              <div key={role.role} className="bg-gray-800 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-transform">
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${role.color} p-6`}>
                  <role.icon className="h-10 w-10 text-white mb-3" />
                  <h3 className="text-xl font-bold">{role.role}</h3>
                </div>
                
                {/* Capabilities */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {role.capabilities.map((cap, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Alur Pesanan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lihat bagaimana pesanan mengalir dari pelanggan hingga disajikan
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            {/* QR Order Flow */}
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <QrCode className="h-6 w-6 text-purple-600" />
                Alur Pemesanan via QR (Self-Order)
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-3 bg-purple-50 rounded-lg px-4 py-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Scan QR</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-3">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Pilih Menu</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-3">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Checkout</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3 bg-orange-50 rounded-lg px-4 py-3">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Kasir Konfirmasi</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3 bg-red-50 rounded-lg px-4 py-3">
                  <ChefHat className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">Dapur Proses</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3 bg-teal-50 rounded-lg px-4 py-3">
                  <Package className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium">Siap Disajikan</span>
                </div>
              </div>
            </div>
            
            {/* POS Order Flow */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Monitor className="h-6 w-6 text-blue-600" />
                Alur Pemesanan via POS (Kasir Input)
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-3">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Kasir Input</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Bayar</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3 bg-indigo-50 rounded-lg px-4 py-3">
                  <Receipt className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium">Cetak Struk</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3 bg-red-50 rounded-lg px-4 py-3">
                  <ChefHat className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">Dapur Proses</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3 bg-teal-50 rounded-lg px-4 py-3">
                  <Package className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium">Siap Disajikan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Harga Transparan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih paket sesuai skala bisnis Anda. Mulai gratis, upgrade kapan saja.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all hover:scale-105 ${
                  plan.recommended
                    ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl shadow-primary/30'
                    : 'bg-white border-2 border-gray-100 hover:border-primary/20 hover:shadow-xl'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      ⭐ POPULER
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm opacity-80">{plan.period}</span>}
                </div>
                <p className={`text-sm ${plan.recommended ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.recommended ? 'bg-white/20' : 'bg-green-100'}`}>
                        <Check className={`h-3 w-3 ${plan.recommended ? 'text-white' : 'text-green-600'}`} />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block mt-8">
                  <Button
                    className={`w-full h-12 font-semibold ${
                      plan.recommended ? 'bg-white text-primary hover:bg-gray-100 shadow-lg' : ''
                    }`}
                    variant={plan.recommended ? 'secondary' : 'default'}
                  >
                    Mulai Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-purple-700" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Siap Transformasi Bisnis Anda?
          </h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
            Bergabung dengan ribuan bisnis yang sudah menggunakan ORIXA. Setup cepat, hasil nyata!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all">
                Daftar Gratis Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/track">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur">
                Lacak Pesanan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">ORIXA</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Platform POS modern untuk F&B, Retail, dan Service. Satu solusi untuk semua kebutuhan operasional bisnis.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">QR Menu</li>
                <li className="hover:text-white transition-colors cursor-pointer">POS Kasir</li>
                <li className="hover:text-white transition-colors cursor-pointer">Kitchen Display</li>
                <li className="hover:text-white transition-colors cursor-pointer">Laporan & Analitik</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Dukungan</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/track" className="hover:text-white transition-colors">Lacak Pesanan</Link></li>
                <li className="hover:text-white transition-colors cursor-pointer">Dokumentasi</li>
                <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
                <li className="hover:text-white transition-colors cursor-pointer">Hubungi Kami</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Demo</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/m/TABLE001" className="hover:text-white transition-colors">Demo QR Menu</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} ORIXA. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
