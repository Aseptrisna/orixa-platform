import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingCard } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { reportsApi, outletsApi, posApi } from '@/api';
import { formatCurrency } from '@/lib/utils';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Store,
  Clock,
  ChefHat,
  ArrowRight,
  Users,
  RefreshCw,
  LayoutDashboard,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { Link } from 'react-router-dom';
import { IOutlet } from '@orixa/shared';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');

  const { data: outlets, isLoading: loadingOutlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const outletsArray: IOutlet[] = outlets?.data?.data || outlets?.data || [];

  // Set default outlet
  useEffect(() => {
    if (outletsArray.length && !selectedOutletId) {
      const firstOutlet = user?.outletIds?.length 
        ? outletsArray.find((o) => user.outletIds?.includes(o._id))
        : outletsArray[0];
      if (firstOutlet) {
        setSelectedOutletId(firstOutlet._id);
      }
    }
  }, [outletsArray, user, selectedOutletId]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const { data: report, isLoading: loadingReport, refetch: refetchReport } = useQuery({
    queryKey: ['daily-report', selectedOutletId, today],
    queryFn: () => reportsApi.getDaily(selectedOutletId, today),
    enabled: !!selectedOutletId,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: recentOrders, isLoading: loadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['recent-orders', selectedOutletId],
    queryFn: () => posApi.getOrders({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId,
  });

  // Order notifications with realtime updates
  useOrderNotifications({
    outletId: selectedOutletId,
    onNewOrder: () => {
      // Refresh data when new order comes in
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['daily-report'] });
    },
    onOrderStatusUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
    },
    onPaymentUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-report'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
    },
  });

  const reportData = report?.data;
  const ordersData = recentOrders?.data?.data || recentOrders?.data || [];
  // Get latest 5 orders
  const ordersArray = Array.isArray(ordersData) ? ordersData.slice(0, 5) : [];

  const selectedOutlet = outletsArray.find((o) => o._id === selectedOutletId);

  const stats = [
    {
      title: 'Penjualan Hari Ini',
      value: formatCurrency(reportData?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30',
      borderColor: 'border-emerald-200 dark:border-emerald-700',
    },
    {
      title: 'Total Order',
      value: reportData?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
      borderColor: 'border-blue-200 dark:border-blue-700',
    },
    {
      title: 'Rata-rata Order',
      value: formatCurrency(reportData?.averageOrderValue || 0),
      icon: TrendingUp,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/30',
      borderColor: 'border-violet-200 dark:border-violet-700',
    },
    {
      title: 'Outlet Aktif',
      value: outletsArray.length || 0,
      icon: Store,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30',
      borderColor: 'border-amber-200 dark:border-amber-700',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
      ACCEPTED: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-700',
      IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700',
      READY: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
      SERVED: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
      CLOSED: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      PAID: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
      UNPAID: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleRefresh = () => {
    refetchReport();
    refetchOrders();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`Selamat datang kembali, ${user?.name}`}
        icon={LayoutDashboard}
        iconColor="from-primary to-primary/80"
      >
        <div className="flex items-center gap-3">
          {/* Outlet Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg shadow-sm">
            <MapPin className="h-4 w-4 text-slate-400" />
            <select
              className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
            >
              {outletsArray.map((outlet) => (
                <option key={outlet._id} value={outlet._id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="dark:border-slate-600 dark:hover:bg-slate-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/* Current Outlet Info */}
      {selectedOutlet && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Store className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Menampilkan data untuk: <strong>{selectedOutlet.name}</strong>
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`${stat.bg} border ${stat.borderColor} overflow-hidden`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">
                    {loadingReport || loadingOutlets ? (
                      <span className="inline-block w-16 sm:w-20 h-6 sm:h-7 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur shadow-sm">
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/pos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-100 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-600 dark:bg-slate-800">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white truncate">Buka POS</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Buat pesanan baru</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 hidden sm:block" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/kds">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-100 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-600 dark:bg-slate-800">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-orange-100 dark:bg-orange-900/50">
                  <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white truncate">Kitchen Display</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Lihat pesanan dapur</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 hidden sm:block" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-100 hover:border-emerald-300 dark:border-emerald-800 dark:hover:border-emerald-600 dark:bg-slate-800">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white truncate">Lihat Laporan</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Analisis penjualan</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 hidden sm:block" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card className="shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg dark:text-white">
                <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                Order Terbaru
              </CardTitle>
              <CardDescription className="dark:text-slate-400">5 pesanan terakhir</CardDescription>
            </div>
            <Link to="/admin/transactions">
              <Button variant="ghost" size="sm" className="dark:hover:bg-slate-700">
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingOrders ? (
            <div className="p-6"><LoadingCard /></div>
          ) : ordersArray.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Belum ada order hari ini</p>
              <Link to="/pos">
                <Button variant="outline" size="sm" className="mt-4 dark:border-slate-600 dark:hover:bg-slate-700">
                  Buat Order Baru
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y dark:divide-slate-700">
              {ordersArray.map((order: any) => (
                <div key={order._id} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">#{order.orderCode}</p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        {order.customer?.name || 'Guest'} • {order.items?.length || 0} item
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:block">
                      <p className="font-semibold text-slate-800 dark:text-white">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-0.5 sm:px-2.5 rounded-full border font-medium ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 sm:px-2.5 rounded-full border font-medium ${getPaymentBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
