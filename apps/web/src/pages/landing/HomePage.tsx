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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            ORIXA
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Daftar Gratis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Platform POS Modern
            <br />
            untuk Semua Bisnis
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            F&B, Retail, atau Service - satu platform untuk semua kebutuhan operasional bisnis Anda
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Mulai Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/m/TABLE001">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Demo QR Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-lg p-6 shadow-sm">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Cara Kerja ORIXA</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Alur sederhana dari pendaftaran hingga pesanan sampai ke pelanggan
            </p>
          </div>
          
          <div className="relative">
            {/* Connection line - desktop only */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 opacity-20" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    {/* Step number */}
                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg mb-4`}>
                      {item.step}
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className={`p-3 ${item.color} bg-opacity-10 rounded-xl`}>
                        <item.icon className={`h-6 w-6 ${item.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow - show between items on desktop */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Harga</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg p-6 ${
                  plan.recommended
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-white border'
                }`}
              >
                {plan.recommended && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
                    Recommended
                  </span>
                )}
                <h3 className="text-2xl font-bold mt-4">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm opacity-80">{plan.period}</span>}
                </div>
                <p className={`mt-2 ${plan.recommended ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    className={`w-full mt-6 ${
                      plan.recommended ? 'bg-white text-primary hover:bg-gray-100' : ''
                    }`}
                    variant={plan.recommended ? 'secondary' : 'default'}
                  >
                    Pilih Paket
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Memulai?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Daftar sekarang dan kelola bisnis Anda dengan lebih mudah. Setup dalam 5 menit!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Daftar Gratis Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/track">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Lacak Pesanan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">ORIXA</h3>
              <p className="text-gray-400 text-sm">
                Platform POS modern untuk F&B, Retail, dan Service. Satu solusi untuk semua kebutuhan operasional bisnis.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>QR Menu</li>
                <li>POS Kasir</li>
                <li>Kitchen Display</li>
                <li>Laporan & Analitik</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Dukungan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/track" className="hover:text-white">Lacak Pesanan</Link></li>
                <li>Dokumentasi</li>
                <li>FAQ</li>
                <li>Hubungi Kami</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Demo</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/m/TABLE001" className="hover:text-white">Demo QR Menu</Link></li>
                <li><Link to="/login" className="hover:text-white">Login Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} ORIXA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
