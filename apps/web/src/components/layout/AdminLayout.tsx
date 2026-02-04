import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Users,
  BarChart3,
  LogOut,
  QrCode,
  ChefHat,
  Monitor,
  Settings,
  Receipt,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/outlets', label: 'Outlets', icon: Store },
  { path: '/admin/tables', label: 'Tables & QR', icon: QrCode },
  { path: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/transactions', label: 'Transaksi', icon: Receipt },
  { path: '/admin/expenses', label: 'Pengeluaran', icon: Wallet },
  { path: '/admin/reports', label: 'Laporan Penjualan', icon: BarChart3 },
  { path: '/admin/financial', label: 'Laporan Keuangan', icon: TrendingUp },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="h-6 w-6 text-slate-600 dark:text-slate-300" />
        </button>
        <Link to="/admin" className="text-xl font-bold text-primary">
          ORIXA
        </Link>
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ThemeIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 shadow-xl border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary to-primary/80">
          <Link to="/admin" className="text-2xl font-bold text-white tracking-tight">
            ORIXA
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-white/20"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-16rem)]">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Menu Utama
          </p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive(item.path, item.exact)
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5',
                isActive(item.path, item.exact) ? 'text-white' : 'text-slate-400 dark:text-slate-500'
              )} />
              {item.label}
            </Link>
          ))}

          <div className="my-4 border-t border-slate-200 dark:border-slate-700" />
          
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Operasional
          </p>
          <Link
            to="/pos"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200"
          >
            <Monitor className="h-5 w-5 text-blue-500" />
            POS Kasir
          </Link>
          <Link
            to="/kds"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-700 dark:hover:text-orange-400 transition-all duration-200"
          >
            <ChefHat className="h-5 w-5 text-orange-500" />
            Kitchen Display
          </Link>
        </nav>

        {/* Theme Toggle & User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {/* Theme Toggle */}
          <div className="hidden lg:flex items-center justify-between mb-3 px-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Tema</span>
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  theme === 'light' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'hover:bg-slate-300 dark:hover:bg-slate-600'
                )}
              >
                <Sun className="h-4 w-4 text-yellow-500" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  theme === 'dark' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'hover:bg-slate-300 dark:hover:bg-slate-600'
                )}
              >
                <Moon className="h-4 w-4 text-blue-500" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  theme === 'system' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'hover:bg-slate-300 dark:hover:bg-slate-600'
                )}
              >
                <Laptop className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          <Link 
            to="/admin/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors mb-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
            <Settings className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
