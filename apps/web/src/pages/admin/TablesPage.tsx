import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi, outletsApi } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingCard, Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { Plus, Trash2, QrCode, Copy, Printer, Download, X, Link, Power, PowerOff, LayoutGrid, Store } from 'lucide-react';
import { ITable, IOutlet } from '@orixa/shared';

export default function TablesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [showQR, setShowQR] = useState<ITable | null>(null);
  const queryClient = useQueryClient();

  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const outletsList = outlets?.data?.data || outlets?.data || [];

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables', selectedOutletId],
    queryFn: () => tablesApi.getAll({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId,
  });

  const tablesList = tables?.data?.data || tables?.data || [];

  const createMutation = useMutation({
    mutationFn: tablesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Meja berhasil dibuat');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat meja');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tablesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Status meja berhasil diupdate');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal update status meja');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tablesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Meja berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal hapus meja');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      outletId: selectedOutletId,
      name: formData.get('name') as string,
    };
    createMutation.mutate(data);
  };

  const toggleTableStatus = (table: ITable) => {
    updateMutation.mutate({
      id: table._id,
      data: { isActive: !table.isActive }
    });
  };

  const getQRUrl = (table: ITable) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/m/${table.qrToken}`;
  };

  const copyQRUrl = (table: ITable) => {
    navigator.clipboard.writeText(getQRUrl(table));
    toast.success('Link QR berhasil disalin');
  };

  const downloadQR = (table: ITable) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(getQRUrl(table))}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${table.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code berhasil didownload');
  };

  // Set default outlet
  if (outletsList.length && !selectedOutletId) {
    setSelectedOutletId(outletsList[0]._id);
  }

  const activeCount = tablesList.filter((t: ITable) => t.isActive).length;
  const inactiveCount = tablesList.filter((t: ITable) => !t.isActive).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Meja & QR Code"
        description="Kelola meja dan generate QR code"
        icon={QrCode}
        iconColor="from-purple-500 to-purple-600"
      >
        <Button 
          onClick={() => setShowForm(true)} 
          disabled={!selectedOutletId}
          className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-lg shadow-slate-200 dark:shadow-slate-900"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Meja
        </Button>
      </PageHeader>

      {/* Outlet selector & Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Outlet</Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              className="w-72 h-10 pl-10 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white dark:bg-slate-700 dark:text-white appearance-none cursor-pointer"
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

        {selectedOutletId && tablesList.length > 0 && (
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{activeCount} Aktif</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{inactiveCount} Nonaktif</span>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden dark:bg-slate-800">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Tambah Meja Baru</h2>
            <p className="text-slate-300 text-sm">QR code akan otomatis di-generate setelah meja dibuat</p>
          </div>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nama/Nomor Meja <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Contoh: Meja 1, VIP-01, Outdoor-A"
                    className="pl-10 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-slate-400 focus:ring-slate-400"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gunakan nama yang mudah diidentifikasi pelanggan</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-slate-800 to-slate-700"
                >
                  {createMutation.isPending && <Spinner size="sm" className="mr-2" />}
                  Buat Meja
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl animate-in fade-in zoom-in duration-200 dark:bg-slate-800">
            <CardHeader className="relative bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
              <button 
                onClick={() => setShowQR(null)}
                className="absolute right-4 top-4 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">QR Code</CardTitle>
                  <CardDescription className="text-slate-300">{showQR.name}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-white dark:bg-slate-700 p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(getQRUrl(showQR))}`}
                  alt="QR Code"
                  className="rounded-lg"
                />
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg w-full">
                  <Link className="h-4 w-4 shrink-0" />
                  <span className="truncate">{getQRUrl(showQR)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-slate-200 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => copyQRUrl(showQR)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Salin Link
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-200 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => downloadQR(showQR)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              
              <Button
                className="w-full bg-gradient-to-r from-slate-800 to-slate-700"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Cetak QR Code
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List */}
      {!selectedOutletId ? (
        <Card className="border-slate-200 dark:border-slate-700 border-dashed dark:bg-slate-800">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Pilih Outlet</h3>
            <p className="text-slate-500 dark:text-slate-400">Pilih outlet terlebih dahulu untuk melihat daftar meja</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <LoadingCard />
      ) : tablesList.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-700 border-dashed dark:bg-slate-800">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <LayoutGrid className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Belum Ada Meja</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Mulai dengan menambahkan meja pertama untuk outlet ini</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-slate-800 to-slate-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Meja
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {tablesList.map((table: ITable) => (
            <Card 
              key={table._id} 
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-slate-800 ${
                table.isActive 
                  ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 opacity-75'
              }`}
            >
              {/* Status indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                table.isActive 
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700'
              }`} />

              <CardContent className="p-4 pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Table Icon/Name */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold transition-colors ${
                    table.isActive 
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-500 dark:text-slate-400'
                  }`}>
                    {table.name.match(/\d+/)?.[0] || table.name.charAt(0)}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{table.name}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${
                      table.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        table.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                      {table.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
                      onClick={() => setShowQR(table)}
                      title="Lihat QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-9 w-9 ${
                        table.isActive 
                          ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-amber-900/30' 
                          : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30'
                      }`}
                      onClick={() => toggleTableStatus(table)}
                      disabled={updateMutation.isPending}
                      title={table.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {table.isActive ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                      onClick={() => {
                        if (confirm('Hapus meja ini?')) {
                          deleteMutation.mutate(table._id);
                        }
                      }}
                      title="Hapus Meja"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Token (hidden until hover) */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-slate-400 text-center font-mono truncate">
                    {table.qrToken}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
