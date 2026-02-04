import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Receipt, DollarSign, Calendar, FileSpreadsheet, ChevronLeft, ChevronRight, TrendingDown } from 'lucide-react';
import { expensesApi, outletsApi } from '@/api';
import { ExpenseCategory, EXPENSE_CATEGORY_LABELS } from '@orixa/shared';
import { toast } from 'sonner';

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    BAHAN_BAKU: 'bg-orange-100 text-orange-700',
    GAJI: 'bg-blue-100 text-blue-700',
    LISTRIK: 'bg-yellow-100 text-yellow-700',
    AIR: 'bg-cyan-100 text-cyan-700',
    SEWA: 'bg-purple-100 text-purple-700',
    TRANSPORT: 'bg-green-100 text-green-700',
    PERLENGKAPAN: 'bg-pink-100 text-pink-700',
    MAINTENANCE: 'bg-red-100 text-red-700',
    MARKETING: 'bg-indigo-100 text-indigo-700',
    LAINNYA: 'bg-gray-100 text-gray-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [filters, setFilters] = useState({
    outletId: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  });

  // Form state
  const [formData, setFormData] = useState({
    outletId: '',
    category: ExpenseCategory.BAHAN_BAKU,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    receiptUrl: '',
  });

  // Queries
  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expensesApi.getAll(filters),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['expenses-summary', { outletId: filters.outletId, startDate: filters.startDate, endDate: filters.endDate }],
    queryFn: () => expensesApi.getSummary({
      outletId: filters.outletId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => expensesApi.create(data.outletId, {
      category: data.category,
      description: data.description,
      amount: Number(data.amount),
      date: data.date,
      note: data.note,
      receiptUrl: data.receiptUrl,
    }),
    onSuccess: () => {
      toast.success('Pengeluaran berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      resetForm();
    },
    onError: () => toast.error('Gagal menambahkan pengeluaran'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => expensesApi.update(id, {
      ...data,
      amount: Number(data.amount),
    }),
    onSuccess: () => {
      toast.success('Pengeluaran berhasil diupdate');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      resetForm();
    },
    onError: () => toast.error('Gagal mengupdate pengeluaran'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      toast.success('Pengeluaran berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
    },
    onError: () => toast.error('Gagal menghapus pengeluaran'),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingExpense(null);
    setFormData({
      outletId: '',
      category: ExpenseCategory.BAHAN_BAKU,
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      receiptUrl: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.outletId) {
      toast.error('Pilih outlet terlebih dahulu');
      return;
    }
    if (!formData.description) {
      toast.error('Deskripsi harus diisi');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Jumlah harus lebih dari 0');
      return;
    }

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      outletId: expense.outletId?._id || expense.outletId,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split('T')[0],
      note: expense.note || '',
      receiptUrl: expense.receiptUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus pengeluaran ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async () => {
    try {
      const response = await expensesApi.export({
        outletId: filters.outletId || undefined,
        category: filters.category || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      
      // Convert data to CSV
      const data = response.data;
      if (!data || data.length === 0) {
        toast.error('Tidak ada data untuk diexport');
        return;
      }

      const headers = ['Tanggal', 'Outlet', 'Kategori', 'Deskripsi', 'Jumlah', 'Catatan'];
      const rows = data.map((item: any) => [
        formatDate(item.date),
        item.outletId?.name || '-',
        EXPENSE_CATEGORY_LABELS[item.category as ExpenseCategory] || item.category,
        item.description,
        item.amount,
        item.note || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `pengeluaran_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Export berhasil');
    } catch (error) {
      toast.error('Gagal export data');
    }
  };

  const expenses = expensesData?.data?.data || [];
  const total = expensesData?.data?.total || 0;
  const totalPages = Math.ceil(total / filters.limit);
  const summary = summaryData?.data;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengeluaran</h1>
          <p className="text-gray-500 text-sm">Kelola pengeluaran per outlet</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Pengeluaran
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pengeluaran</p>
              <p className="text-xl font-bold text-gray-900">{formatRupiah(summary?.grandTotal || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jumlah Transaksi</p>
              <p className="text-xl font-bold text-gray-900">{summary?.totalCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rata-rata/Transaksi</p>
              <p className="text-xl font-bold text-gray-900">
                {formatRupiah(summary?.totalCount ? summary.grandTotal / summary.totalCount : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* By Category Summary */}
      {summary?.byCategory && summary.byCategory.length > 0 && (
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Pengeluaran per Kategori</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {summary.byCategory.map((cat: any) => (
              <div key={cat._id} className={`p-3 rounded-lg ${getCategoryColor(cat._id)}`}>
                <p className="text-xs font-medium">{EXPENSE_CATEGORY_LABELS[cat._id as ExpenseCategory] || cat._id}</p>
                <p className="text-sm font-bold mt-1">{formatRupiah(cat.total)}</p>
                <p className="text-xs opacity-75">{cat.count} transaksi</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[150px]">
            <select
              value={filters.outletId}
              onChange={(e) => setFilters({ ...filters, outletId: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Semua Outlet</option>
              {outlets?.data?.map((outlet: any) => (
                <option key={outlet._id} value={outlet._id}>{outlet.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Semua Kategori</option>
              {Object.values(ExpenseCategory).map((cat) => (
                <option key={cat} value={cat}>{EXPENSE_CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada data pengeluaran</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outlet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((expense: any) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatDate(expense.date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {expense.outletId?.name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                          {EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory] || expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{expense.description}</p>
                        {expense.note && (
                          <p className="text-xs text-gray-500 mt-1">{expense.note}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-red-600">
                          -{formatRupiah(expense.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Menampilkan {(filters.page - 1) * filters.limit + 1} - {Math.min(filters.page * filters.limit, total)} dari {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page <= 1}
                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Hal {filters.page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page >= totalPages}
                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outlet *</label>
                <select
                  value={formData.outletId}
                  onChange={(e) => setFormData({ ...formData, outletId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Pilih Outlet</option>
                  {outlets?.data?.map((outlet: any) => (
                    <option key={outlet._id} value={outlet._id}>{outlet.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {Object.values(ExpenseCategory).map((cat) => (
                    <option key={cat} value={cat}>{EXPENSE_CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Pembelian bahan baku"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Catatan tambahan..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Bukti (opsional)</label>
                <input
                  type="url"
                  value={formData.receiptUrl}
                  onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
