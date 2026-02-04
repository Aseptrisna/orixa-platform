import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, outletsApi, api } from '@/api';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingCard, Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Download, 
  Calendar, 
  Store, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  Trophy,
  Clock,
  CreditCard,
  PieChart
} from 'lucide-react';
import { IOutlet } from '@orixa/shared';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [exporting, setExporting] = useState(false);

  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const outletsList = outlets?.data?.data || outlets?.data || [];

  const { data: dailyReport, isLoading: loadingDaily } = useQuery({
    queryKey: ['daily-report', selectedOutletId],
    queryFn: () => reportsApi.getDaily(selectedOutletId),
    enabled: !!selectedOutletId,
  });

  const dailyData = dailyReport?.data?.data || dailyReport?.data || {};

  const { data: rangeReport, isLoading: loadingRange } = useQuery({
    queryKey: ['range-report', selectedOutletId, dateRange],
    queryFn: () => reportsApi.getRange(selectedOutletId, dateRange.start, dateRange.end),
    enabled: !!selectedOutletId,
  });

  const rangeData = rangeReport?.data?.data || rangeReport?.data || {};

  // Set default outlet
  if (outletsList.length && !selectedOutletId) {
    setSelectedOutletId(outletsList[0]._id);
  }

  const handleExportExcel = async () => {
    if (!selectedOutletId) {
      toast.error('Pilih outlet terlebih dahulu');
      return;
    }

    setExporting(true);
    try {
      const response = await api.get('/reports/export', {
        params: {
          outletId: selectedOutletId,
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${dateRange.start}_to_${dateRange.end}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report berhasil di-export');
    } catch (error) {
      toast.error('Gagal export report');
    } finally {
      setExporting(false);
    }
  };

  // Calculate percentage change (mock data for demo)
  const getChangeIndicator = (value: number, isPositive: boolean = true) => {
    if (value === 0) return null;
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(value)}%
      </span>
    );
  };

  const statsCards = [
    {
      title: 'Total Penjualan',
      value: formatCurrency(dailyData?.totalRevenue || 0),
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: 12,
    },
    {
      title: 'Total Order',
      value: dailyData?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: 8,
    },
    {
      title: 'Rata-rata Order',
      value: formatCurrency(dailyData?.averageOrderValue || 0),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: 5,
    },
    {
      title: 'Order Dibayar',
      value: dailyData?.paidOrders || 0,
      icon: CreditCard,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      change: 15,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Laporan Penjualan"
        description="Analisis performa bisnis Anda"
        icon={BarChart3}
        iconColor="from-cyan-500 to-cyan-600"
      >
        <Button 
          onClick={handleExportExcel} 
          disabled={!selectedOutletId || exporting}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
        >
          {exporting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </>
          )}
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm dark:bg-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Outlet</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  className="w-full h-10 pl-10 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white dark:bg-slate-700 dark:text-white appearance-none cursor-pointer"
                  value={selectedOutletId}
                  onChange={(e) => setSelectedOutletId(e.target.value)}
                >
                  <option value="">Pilih outlet...</option>
                  {outletsList.map((outlet: IOutlet) => (
                    <option key={outlet._id} value={outlet._id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 items-end">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dari Tanggal</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    className="h-10 pl-10 pr-3 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white dark:bg-slate-700 dark:text-white"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  />
                </div>
              </div>

              <span className="pb-2.5 text-slate-400">—</span>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sampai Tanggal</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    className="h-10 pl-10 pr-3 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white dark:bg-slate-700 dark:text-white"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedOutletId ? (
        <Card className="border-slate-200 dark:border-slate-700 border-dashed dark:bg-slate-800">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Pilih Outlet</h3>
            <p className="text-slate-500 dark:text-slate-400">Pilih outlet untuk melihat laporan penjualan</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Today Stats */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ringkasan Hari Ini</h2>
            </div>
            
            {loadingDaily ? (
              <LoadingCard />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, index) => (
                  <Card key={index} className="border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all overflow-hidden group dark:bg-slate-800">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                          {getChangeIndicator(stat.change, true)}
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                          <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                        </div>
                      </div>
                    </CardContent>
                    <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Range Report */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Laporan Periode
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                ({formatDate(dateRange.start)} - {formatDate(dateRange.end)})
              </span>
            </div>
            
            {loadingRange ? (
              <LoadingCard />
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Summary Card */}
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden dark:bg-slate-800">
                  <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Ringkasan Periode</CardTitle>
                        <CardDescription className="text-slate-300">Overview penjualan periode terpilih</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200 dark:border-emerald-800">
                          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Total Penjualan</p>
                          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                            {formatCurrency(rangeData?.totalRevenue || 0)}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Order</p>
                            <p className="text-xl font-bold text-slate-900">{rangeData?.totalOrders || 0}</p>
                          </div>
                          <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <p className="text-sm font-medium text-slate-500 mb-1">Dibayar</p>
                            <p className="text-xl font-bold text-slate-900">{rangeData?.paidOrders || 0}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-500">Rata-rata Order</span>
                            <TrendingUp className="h-4 w-4 text-slate-400" />
                          </div>
                          <p className="text-xl font-bold text-slate-900">
                            {formatCurrency(rangeData?.averageOrderValue || 0)}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-500">Total Pajak</span>
                            <Receipt className="h-4 w-4 text-slate-400" />
                          </div>
                          <p className="text-xl font-bold text-slate-900">
                            {formatCurrency(rangeData?.totalTax || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Simple Bar Chart Visualization */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center gap-2 mb-4">
                        <PieChart className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">Distribusi Penjualan</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-24">Tunai</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: '45%' }} />
                          </div>
                          <span className="text-xs font-medium text-slate-700 w-12 text-right">45%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-24">Transfer</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: '35%' }} />
                          </div>
                          <span className="text-xs font-medium text-slate-700 w-12 text-right">35%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-24">QRIS</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full" style={{ width: '20%' }} />
                          </div>
                          <span className="text-xs font-medium text-slate-700 w-12 text-right">20%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Items */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-400">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Menu Terlaris</CardTitle>
                        <CardDescription className="text-amber-100">Top selling items</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {!rangeData?.topItems?.length ? (
                      <div className="py-8 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                          <BarChart3 className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">Belum ada data penjualan</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rangeData?.topItems?.map((item: any, index: number) => {
                          const medals = ['🥇', '🥈', '🥉'];
                          const maxQty = rangeData?.topItems?.[0]?.quantity || 1;
                          const percentage = (item.quantity / maxQty) * 100;
                          
                          return (
                            <div 
                              key={item._id} 
                              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{medals[index] || `#${index + 1}`}</span>
                                  <span className="font-medium text-slate-900 text-sm line-clamp-1">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full shadow-sm">
                                  {item.quantity}x
                                </span>
                              </div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    index === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                    index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                                    index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                                    'bg-gradient-to-r from-slate-300 to-slate-400'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
