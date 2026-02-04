import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Building,
} from 'lucide-react';
import { reportsApi, outletsApi } from '@/api';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '@orixa/shared';

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatShortRupiah = (amount: number) => {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}rb`;
  }
  return formatRupiah(amount);
};

const getCategoryColor = (index: number) => {
  const colors = [
    '#6366f1', // indigo
    '#f59e0b', // amber
    '#10b981', // emerald
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#6b7280', // gray
  ];
  return colors[index % colors.length];
};

export default function FinancialReportsPage() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [filters, setFilters] = useState({
    outletId: '',
    startDate: firstDayOfMonth.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    period: 'daily' as 'daily' | 'monthly' | 'yearly',
  });

  // Queries
  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-report', filters],
    queryFn: () => reportsApi.getFinancial(filters),
    enabled: !!filters.startDate && !!filters.endDate,
  });

  const report = financialData?.data;
  const summary = report?.summary;
  const timeSeries = report?.timeSeries || [];
  const expenseByCategory = report?.expenseByCategory || [];
  const incomeByOutlet = report?.incomeByOutlet || [];
  const expenseByOutlet = report?.expenseByOutlet || [];

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    ...timeSeries.map((d: any) => Math.max(d.income, d.expense, d.profit)),
    1
  );

  // Calculate profit margin
  const profitMargin = summary?.totalIncome > 0 
    ? ((summary?.profit / summary?.totalIncome) * 100).toFixed(1) 
    : '0';

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-500 text-sm">Perbandingan pendapatan dan pengeluaran</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[150px]">
            <select
              value={filters.outletId}
              onChange={(e) => setFilters({ ...filters, outletId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Semua Outlet</option>
              {outlets?.data?.map((outlet: any) => (
                <option key={outlet._id} value={outlet._id}>{outlet.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <select
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="daily">Harian</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-pulse" />
          <p>Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Total Pendapatan</p>
                  <p className="text-2xl font-bold">{formatShortRupiah(summary?.totalIncome || 0)}</p>
                  <p className="text-xs text-white/70">{summary?.orderCount || 0} pesanan</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Total Pengeluaran</p>
                  <p className="text-2xl font-bold">{formatShortRupiah(summary?.totalExpense || 0)}</p>
                  <p className="text-xs text-white/70">{summary?.expenseCount || 0} transaksi</p>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br ${(summary?.profit || 0) >= 0 ? 'from-indigo-500 to-purple-600' : 'from-gray-500 to-gray-600'} rounded-xl p-4 text-white shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Laba Bersih</p>
                  <p className="text-2xl font-bold">{formatShortRupiah(summary?.profit || 0)}</p>
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    {(summary?.profit || 0) >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {profitMargin}% margin
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <PieChart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Rasio Pengeluaran</p>
                  <p className="text-2xl font-bold">
                    {summary?.totalIncome > 0 
                      ? ((summary?.totalExpense / summary?.totalIncome) * 100).toFixed(1) 
                      : '0'}%
                  </p>
                  <p className="text-xs text-white/70">dari pendapatan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Time Series Chart */}
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Tren Keuangan
            </h3>
            
            {timeSeries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data untuk periode ini
              </div>
            ) : (
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Pendapatan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Pengeluaran</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                    <span>Laba</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="relative h-64 overflow-x-auto">
                  <div className="flex items-end gap-1 h-full min-w-fit" style={{ minWidth: `${timeSeries.length * 60}px` }}>
                    {timeSeries.map((item: any, index: number) => (
                      <div key={index} className="flex-1 min-w-[50px] flex flex-col items-center group">
                        {/* Bars */}
                        <div className="flex gap-1 items-end h-52 w-full justify-center">
                          {/* Income bar */}
                          <div 
                            className="w-4 bg-green-500 rounded-t transition-all hover:bg-green-600 cursor-pointer relative"
                            style={{ height: `${(item.income / maxValue) * 100}%`, minHeight: item.income > 0 ? '4px' : '0' }}
                            title={`Pendapatan: ${formatRupiah(item.income)}`}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                              {formatShortRupiah(item.income)}
                            </div>
                          </div>
                          
                          {/* Expense bar */}
                          <div 
                            className="w-4 bg-red-500 rounded-t transition-all hover:bg-red-600 cursor-pointer"
                            style={{ height: `${(item.expense / maxValue) * 100}%`, minHeight: item.expense > 0 ? '4px' : '0' }}
                            title={`Pengeluaran: ${formatRupiah(item.expense)}`}
                          />
                          
                          {/* Profit bar */}
                          <div 
                            className={`w-4 ${item.profit >= 0 ? 'bg-indigo-500' : 'bg-gray-400'} rounded-t transition-all hover:bg-indigo-600 cursor-pointer`}
                            style={{ height: `${(Math.abs(item.profit) / maxValue) * 100}%`, minHeight: item.profit !== 0 ? '4px' : '0' }}
                            title={`Laba: ${formatRupiah(item.profit)}`}
                          />
                        </div>
                        
                        {/* Date label */}
                        <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                          {item.date}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense by Category */}
            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                Pengeluaran per Kategori
              </h3>
              
              {expenseByCategory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data pengeluaran
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Simple pie chart visualization */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {(() => {
                          let accumulated = 0;
                          const total = expenseByCategory.reduce((sum: number, cat: any) => sum + cat.total, 0);
                          return expenseByCategory.map((cat: any, index: number) => {
                            const percentage = (cat.total / total) * 100;
                            const offset = accumulated;
                            accumulated += percentage;
                            return (
                              <circle
                                key={cat.category}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke={getCategoryColor(index)}
                                strokeWidth="20"
                                strokeDasharray={`${percentage * 2.51327} ${251.327 - percentage * 2.51327}`}
                                strokeDashoffset={-offset * 2.51327}
                              />
                            );
                          });
                        })()}
                      </svg>
                    </div>
                  </div>

                  {/* Category list */}
                  {expenseByCategory.map((cat: any, index: number) => {
                    const percentage = summary?.totalExpense > 0 
                      ? ((cat.total / summary.totalExpense) * 100).toFixed(1)
                      : '0';
                    return (
                      <div key={cat.category} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCategoryColor(index) }}
                          />
                          <span className="text-sm text-gray-700">
                            {EXPENSE_CATEGORY_LABELS[cat.category as ExpenseCategory] || cat.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{formatRupiah(cat.total)}</p>
                          <p className="text-xs text-gray-500">{percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Income & Expense by Outlet */}
            {!filters.outletId && (incomeByOutlet.length > 0 || expenseByOutlet.length > 0) && (
              <div className="bg-white rounded-xl border p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  Perbandingan per Outlet
                </h3>
                
                <div className="space-y-4">
                  {/* Merge income and expense by outlet */}
                  {(() => {
                    const outletMap = new Map<string, { name: string; income: number; expense: number }>();
                    
                    incomeByOutlet.forEach((item: any) => {
                      outletMap.set(item.outletId.toString(), {
                        name: item.outletName,
                        income: item.total,
                        expense: 0,
                      });
                    });
                    
                    expenseByOutlet.forEach((item: any) => {
                      const existing = outletMap.get(item.outletId.toString());
                      if (existing) {
                        existing.expense = item.total;
                      } else {
                        outletMap.set(item.outletId.toString(), {
                          name: item.outletName,
                          income: 0,
                          expense: item.total,
                        });
                      }
                    });

                    return Array.from(outletMap.entries()).map(([id, data]) => {
                      const profit = data.income - data.expense;
                      return (
                        <div key={id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{data.name}</span>
                            <span className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {profit >= 0 ? '+' : ''}{formatRupiah(profit)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <ArrowUpRight className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600">Pendapatan:</span>
                              <span className="font-medium">{formatShortRupiah(data.income)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ArrowDownRight className="w-4 h-4 text-red-500" />
                              <span className="text-gray-600">Pengeluaran:</span>
                              <span className="font-medium">{formatShortRupiah(data.expense)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
