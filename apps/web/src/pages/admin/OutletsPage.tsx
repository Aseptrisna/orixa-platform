import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { outletsApi } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard, Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Store, Settings, ChevronDown, ChevronUp, MapPin, Phone, CreditCard, QrCode, Building2, Percent } from 'lucide-react';
import { IOutlet, PaymentMethod } from '@orixa/shared';

export default function OutletsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<IOutlet | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'settings' | 'payment'>('basic');
  const [paymentExpanded, setPaymentExpanded] = useState(false);
  const queryClient = useQueryClient();

  const { data: outlets, isLoading } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const outletsList = outlets?.data?.data || outlets?.data || [];

  const createMutation = useMutation({
    mutationFn: outletsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet berhasil dibuat');
      setShowForm(false);
      setActiveFormTab('basic');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat outlet');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => outletsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet berhasil diupdate');
      setEditingOutlet(null);
      setActiveFormTab('basic');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal update outlet');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: outletsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal hapus outlet');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      settings: {
        taxRate: parseFloat(formData.get('taxRate') as string) || 0,
        serviceRate: parseFloat(formData.get('serviceRate') as string) || 0,
        rounding: formData.get('rounding') as string || 'NONE',
        orderMode: formData.get('orderMode') as string || 'QR_AND_POS',
        paymentConfig: {
          enabledMethods: [PaymentMethod.CASH, PaymentMethod.TRANSFER, PaymentMethod.QR],
          transferInstructions: {
            bankName: formData.get('bankName') as string || '',
            accountName: formData.get('accountName') as string || '',
            accountNumberOrVA: formData.get('accountNumber') as string || '',
            note: formData.get('transferNote') as string || '',
          },
          qrInstructions: {
            qrImageUrl: formData.get('qrImageUrl') as string || '',
            note: formData.get('qrNote') as string || '',
          },
        },
      },
    };

    if (editingOutlet) {
      updateMutation.mutate({ id: editingOutlet._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getOrderModeBadge = (mode?: string) => {
    const modes: Record<string, { label: string; color: string }> = {
      'QR_AND_POS': { label: 'QR + POS', color: 'bg-emerald-100 text-emerald-700' },
      'QR_ONLY': { label: 'QR Only', color: 'bg-blue-100 text-blue-700' },
      'POS_ONLY': { label: 'POS Only', color: 'bg-amber-100 text-amber-700' },
    };
    const { label, color } = modes[mode || 'QR_AND_POS'] || modes['QR_AND_POS'];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const formTabs = [
    { id: 'basic', label: 'Informasi Dasar', icon: Store },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Kelola Outlet"
        description="Atur outlet dan pengaturan pembayaran"
        icon={Store}
        iconColor="from-blue-500 to-blue-600"
      >
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-lg shadow-slate-200 dark:shadow-slate-900"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Outlet
        </Button>
      </PageHeader>

      {/* Form */}
      {(showForm || editingOutlet) && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden dark:bg-slate-800">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              {editingOutlet ? 'Edit Outlet' : 'Tambah Outlet Baru'}
            </h2>
            <p className="text-slate-300 text-sm">Lengkapi informasi outlet di bawah ini</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <nav className="flex gap-1 px-4 pt-2">
              {formTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                    activeFormTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-b-0 border-slate-200 dark:border-slate-700 -mb-px'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Tab */}
              {activeFormTab === 'basic' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Nama Outlet <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="Masukkan nama outlet"
                          defaultValue={editingOutlet?.name || ''}
                          className="pl-10 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-slate-400 focus:ring-slate-400"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Telepon</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="08xx-xxxx-xxxx"
                          defaultValue={editingOutlet?.phone || ''}
                          className="pl-10 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-slate-400 focus:ring-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-slate-300">Alamat Lengkap</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <textarea
                        id="address"
                        name="address"
                        placeholder="Masukkan alamat lengkap outlet"
                        defaultValue={editingOutlet?.address || ''}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeFormTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="taxRate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Percent className="h-3.5 w-3.5" />
                          Pajak
                        </div>
                      </Label>
                      <div className="relative">
                        <Input
                          id="taxRate"
                          name="taxRate"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          defaultValue={editingOutlet?.settings?.taxRate ?? 10}
                          className="pr-8 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceRate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Percent className="h-3.5 w-3.5" />
                          Service
                        </div>
                      </Label>
                      <div className="relative">
                        <Input
                          id="serviceRate"
                          name="serviceRate"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          defaultValue={editingOutlet?.settings?.serviceRate ?? 5}
                          className="pr-8 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rounding" className="text-sm font-medium text-slate-700 dark:text-slate-300">Pembulatan</Label>
                      <select
                        id="rounding"
                        name="rounding"
                        className="w-full h-10 border border-slate-200 dark:border-slate-600 rounded-md px-3 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white dark:bg-slate-700 dark:text-white"
                        defaultValue={editingOutlet?.settings?.rounding || 'NONE'}
                      >
                        <option value="NONE">Tidak ada</option>
                        <option value="NEAREST_100">100 terdekat</option>
                        <option value="NEAREST_500">500 terdekat</option>
                        <option value="NEAREST_1000">1000 terdekat</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderMode" className="text-sm font-medium text-slate-700 dark:text-slate-300">Mode Order</Label>
                      <select
                        id="orderMode"
                        name="orderMode"
                        className="w-full h-10 border border-slate-200 dark:border-slate-600 rounded-md px-3 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white dark:bg-slate-700 dark:text-white"
                        defaultValue={editingOutlet?.settings?.orderMode || 'QR_AND_POS'}
                      >
                        <option value="QR_AND_POS">QR + POS</option>
                        <option value="QR_ONLY">QR Only</option>
                        <option value="POS_ONLY">POS Only</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Tab */}
              {activeFormTab === 'payment' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Transfer Section */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPaymentExpanded(!paymentExpanded)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-slate-900 dark:text-white">Transfer Bank</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Konfigurasi rekening transfer</p>
                        </div>
                      </div>
                      {paymentExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                    {paymentExpanded && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bankName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Bank</Label>
                            <Input
                              id="bankName"
                              name="bankName"
                              placeholder="BCA, Mandiri, BRI, dll"
                              defaultValue={editingOutlet?.settings?.paymentConfig?.transferInstructions?.bankName || ''}
                              className="border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Rekening</Label>
                            <Input
                              id="accountName"
                              name="accountName"
                              placeholder="Nama pemilik rekening"
                              defaultValue={editingOutlet?.settings?.paymentConfig?.transferInstructions?.accountName || ''}
                              className="border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">No Rekening/VA</Label>
                            <Input
                              id="accountNumber"
                              name="accountNumber"
                              placeholder="Nomor rekening atau VA"
                              defaultValue={editingOutlet?.settings?.paymentConfig?.transferInstructions?.accountNumberOrVA || ''}
                              className="border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="transferNote" className="text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</Label>
                            <Input
                              id="transferNote"
                              name="transferNote"
                              placeholder="Instruksi tambahan"
                              defaultValue={editingOutlet?.settings?.paymentConfig?.transferInstructions?.note || ''}
                              className="border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QRIS Section */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <QrCode className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">QRIS Payment</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Konfigurasi pembayaran QRIS</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="qrImageUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">URL Gambar QRIS</Label>
                        <Input
                          id="qrImageUrl"
                          name="qrImageUrl"
                          placeholder="https://..."
                          defaultValue={editingOutlet?.settings?.paymentConfig?.qrInstructions?.qrImageUrl || ''}
                          className="border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qrNote" className="text-sm font-medium text-slate-700 dark:text-slate-300">Catatan QRIS</Label>
                        <Input
                          id="qrNote"
                          name="qrNote"
                          placeholder="Instruksi pembayaran QRIS"
                          defaultValue={editingOutlet?.settings?.paymentConfig?.qrInstructions?.note || ''}
                          className="border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <Spinner size="sm" className="mr-2" />}
                  {editingOutlet ? 'Simpan Perubahan' : 'Buat Outlet'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={() => {
                    setShowForm(false);
                    setEditingOutlet(null);
                    setActiveFormTab('basic');
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <LoadingCard />
      ) : outletsList.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-700 border-dashed dark:bg-slate-800">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Belum Ada Outlet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Mulai dengan menambahkan outlet pertama Anda</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-slate-800 to-slate-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Outlet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {outletsList.map((outlet: IOutlet) => (
            <Card 
              key={outlet._id} 
              className="group border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 overflow-hidden dark:bg-slate-800"
            >
              {/* Card Header Gradient */}
              <div className="h-2 bg-gradient-to-r from-slate-700 to-slate-500" />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 group-hover:from-slate-200 group-hover:to-slate-100 dark:group-hover:from-slate-600 dark:group-hover:to-slate-500 transition-colors">
                      <Store className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">{outlet.name}</CardTitle>
                      {getOrderModeBadge(outlet.settings?.orderMode)}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                      onClick={() => setEditingOutlet(outlet)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={() => {
                        if (confirm('Hapus outlet ini?')) {
                          deleteMutation.mutate(outlet._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Address & Phone */}
                <div className="space-y-2">
                  {outlet.address && (
                    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{outlet.address}</span>
                    </div>
                  )}
                  {outlet.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{outlet.phone}</span>
                    </div>
                  )}
                </div>

                {/* Settings Summary */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-700">
                      <Percent className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Tax {outlet.settings?.taxRate || 0}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-700">
                      <Settings className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Service {outlet.settings?.serviceRate || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
