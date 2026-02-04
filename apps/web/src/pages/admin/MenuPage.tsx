import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, menuItemsApi, addonsApi, outletsApi, api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCard, Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, UtensilsCrossed, Upload, X, Store, Tag, Layers, Package, ImageIcon, Check } from 'lucide-react';
import { ICategory, IMenuItem, IAddon, IOutlet } from '@orixa/shared';
import { formatCurrency, formatRupiahInput, parseRupiahInput } from '@/lib/utils';

type Tab = 'categories' | 'items' | 'addons';

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<Tab>('items');
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [priceDisplay, setPriceDisplay] = useState<string>('');
  const [addonPriceDisplay, setAddonPriceDisplay] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Reset form when editing item changes
  useEffect(() => {
    if (editingItem) {
      setImageUrl(editingItem.imageUrl || '');
      setImagePreview(editingItem.imageUrl || '');
      setPriceDisplay(editingItem.basePrice ? formatRupiahInput(editingItem.basePrice.toString()) : '');
    } else {
      setImageUrl('');
      setImagePreview('');
      setPriceDisplay('');
    }
  }, [editingItem]);

  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const outletsList = outlets?.data?.data || outlets?.data || [];

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', selectedOutletId],
    queryFn: () => categoriesApi.getAll({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId,
  });

  const categoriesList = categories?.data?.data || categories?.data || [];

  const { data: menuItems, isLoading: loadingItems } = useQuery({
    queryKey: ['menu-items', selectedOutletId, selectedCategoryId],
    queryFn: () => menuItemsApi.getAll({ 
      outletId: selectedOutletId,
      categoryId: selectedCategoryId || undefined
    }),
    enabled: !!selectedOutletId,
  });

  const menuItemsList = menuItems?.data?.data || menuItems?.data || [];

  const { data: addons, isLoading: loadingAddons } = useQuery({
    queryKey: ['addons', selectedOutletId],
    queryFn: () => addonsApi.getAll({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId,
  });

  const addonsList = addons?.data?.data || addons?.data || [];

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori berhasil dibuat');
      setShowCategoryForm(false);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori berhasil dihapus');
    },
  });

  const createItemMutation = useMutation({
    mutationFn: menuItemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item berhasil dibuat');
      setShowItemForm(false);
      setPriceDisplay('');
      setImageUrl('');
      setImagePreview('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat menu item');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => menuItemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item berhasil diupdate');
      setEditingItem(null);
      setShowItemForm(false);
      setPriceDisplay('');
      setImageUrl('');
      setImagePreview('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengupdate menu item');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: menuItemsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item berhasil dihapus');
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { stock?: number | null; isAvailable?: boolean } }) => 
      menuItemsApi.updateStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Stok berhasil diupdate');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengupdate stok');
    },
  });

  const createAddonMutation = useMutation({
    mutationFn: addonsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      toast.success('Addon berhasil dibuat');
      setShowAddonForm(false);
      setAddonPriceDisplay('');
    },
  });

  const deleteAddonMutation = useMutation({
    mutationFn: addonsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      toast.success('Addon berhasil dihapus');
    },
  });

  // Set default outlet
  if (outletsList.length && !selectedOutletId) {
    setSelectedOutletId(outletsList[0]._id);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    // Preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Build full URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const uploadedUrl = response.data.url.startsWith('http') 
        ? response.data.url 
        : `${apiUrl}${response.data.url}`;
      
      // Set the URL state - this will be used when form is submitted
      setImageUrl(uploadedUrl);
      
      toast.success('Gambar berhasil diupload!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal upload gambar');
      setImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Build data object - imageUrl from state has priority
    const data = {
      outletId: selectedOutletId,
      categoryId: formData.get('categoryId') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      basePrice: parseRupiahInput(priceDisplay || '0'),
      imageUrl: imageUrl || undefined, // Use the state value directly
    };

    console.log('Submitting menu item:', data); // Debug log

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem._id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const tabs = [
    { id: 'categories' as Tab, label: 'Kategori', icon: Layers, count: categoriesList.length },
    { id: 'items' as Tab, label: 'Menu Item', icon: UtensilsCrossed, count: menuItemsList.length },
    { id: 'addons' as Tab, label: 'Addon', icon: Package, count: addonsList.length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Menu Management"
        description="Kelola kategori, menu item, dan addon"
        icon={UtensilsCrossed}
        iconColor="from-orange-500 to-orange-600"
      />

      {/* Outlet selector & Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Outlet</Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              className="w-72 h-10 pl-10 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white dark:bg-slate-700 dark:text-white appearance-none cursor-pointer"
              value={selectedOutletId}
              onChange={(e) => {
                setSelectedOutletId(e.target.value);
                setSelectedCategoryId('');
              }}
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

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {selectedOutletId && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {!selectedOutletId ? (
        <Card className="border-slate-200 dark:border-slate-700 border-dashed dark:bg-slate-800">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Pilih Outlet</h3>
            <p className="text-slate-500 dark:text-slate-400">Pilih outlet terlebih dahulu untuk mengelola menu</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kategori
                </Button>
              </div>

              {showCategoryForm && (
                <Card className="border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden dark:bg-slate-800">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">Tambah Kategori Baru</h2>
                  </div>
                  <CardContent className="pt-6">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        createCategoryMutation.mutate({
                          outletId: selectedOutletId,
                          name: formData.get('name') as string,
                          sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
                        });
                      }}
                      className="flex flex-col md:flex-row gap-4 items-end"
                    >
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Nama Kategori <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input name="name" placeholder="Contoh: Makanan, Minuman, Dessert" className="pl-10 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white" required />
                        </div>
                      </div>
                      <div className="w-full md:w-32 space-y-2">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Urutan</Label>
                        <Input name="sortOrder" type="number" defaultValue={0} className="border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={createCategoryMutation.isPending} className="bg-gradient-to-r from-slate-800 to-slate-700">
                          {createCategoryMutation.isPending && <Spinner size="sm" className="mr-2" />}
                          Simpan
                        </Button>
                        <Button type="button" variant="outline" className="border-slate-200 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setShowCategoryForm(false)}>
                          Batal
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {loadingCategories ? (
                <LoadingCard />
              ) : categoriesList.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-700 border-dashed dark:bg-slate-800">
                  <CardContent className="py-16 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                      <Layers className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Belum Ada Kategori</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Buat kategori untuk mengelompokkan menu item</p>
                    <Button onClick={() => setShowCategoryForm(true)} className="bg-gradient-to-r from-slate-800 to-slate-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Kategori
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {categoriesList.map((category: ICategory, index: number) => (
                    <Card key={category._id} className="group border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all dark:bg-slate-800">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-semibold text-slate-700 dark:text-slate-300">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">{category.name}</span>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Urutan: {category.sortOrder || 0}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (confirm('Hapus kategori ini?')) {
                              deleteCategoryMutation.mutate(category._id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    className="w-56 h-10 pl-10 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white dark:bg-slate-700 dark:text-white appearance-none cursor-pointer"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    <option value="">Semua kategori</option>
                    {categoriesList.map((cat: ICategory) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  onClick={() => {
                    setShowItemForm(true);
                    setPriceDisplay('');
                  }}
                  className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Item
                </Button>
              </div>

              {(showItemForm || editingItem) && (
                <Card className="border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden dark:bg-slate-800">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">
                      {editingItem ? 'Edit Menu Item' : 'Tambah Menu Item'}
                    </h2>
                    <p className="text-slate-300 text-sm">Lengkapi detail menu di bawah ini</p>
                  </div>
                  <CardContent className="pt-6">
                    <form onSubmit={handleItemSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Nama Menu <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            name="name" 
                            placeholder="Contoh: Nasi Goreng Spesial"
                            defaultValue={editingItem?.name || ''} 
                            className="border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Kategori <span className="text-red-500">*</span>
                          </Label>
                          <select
                            name="categoryId"
                            className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white"
                            defaultValue={editingItem?.categoryId || ''}
                            required
                          >
                            <option value="">Pilih kategori</option>
                            {categoriesList.map((cat: ICategory) => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Deskripsi</Label>
                        <textarea
                          name="description"
                          placeholder="Deskripsi singkat menu..."
                          defaultValue={editingItem?.description || ''}
                          rows={2}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">
                            Harga <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">Rp</span>
                            <Input 
                              name="basePrice"
                              placeholder="0"
                              value={priceDisplay}
                              onChange={(e) => setPriceDisplay(formatRupiahInput(e.target.value))}
                              className="pl-10 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white font-mono"
                              required
                            />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Format otomatis: 25.000 = Rp 25.000</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gambar</Label>
                          <div className="space-y-3">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            
                            {/* Image preview or upload button */}
                            {(imagePreview || imageUrl) && !uploadingImage ? (
                              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                                <img 
                                  src={imagePreview || imageUrl} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button 
                                    type="button" 
                                    size="sm"
                                    variant="outline"
                                    className="bg-white/90"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Ganti
                                  </Button>
                                  <Button 
                                    type="button" 
                                    size="sm"
                                    variant="outline"
                                    className="bg-white/90 text-red-600 hover:text-red-700"
                                    onClick={clearImage}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="absolute bottom-2 right-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500 text-white text-xs">
                                    <Check className="h-3 w-3" />
                                    Uploaded
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="w-full h-32 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400"
                              >
                                {uploadingImage ? (
                                  <>
                                    <Spinner size="sm" />
                                    <span className="text-sm">Mengupload...</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="h-8 w-8 text-slate-400" />
                                    <span className="text-sm">Klik untuk upload gambar</span>
                                    <span className="text-xs text-slate-400">JPG, PNG, GIF, WEBP (Maks 5MB)</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Show URL if uploaded */}
                            {imageUrl && (
                              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">
                                  ✓ Gambar tersimpan:
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-500 break-all font-mono">
                                  {imageUrl}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button 
                          type="submit" 
                          disabled={createItemMutation.isPending || updateItemMutation.isPending || uploadingImage}
                          className="bg-gradient-to-r from-slate-800 to-slate-700"
                        >
                          {(createItemMutation.isPending || updateItemMutation.isPending) && <Spinner size="sm" className="mr-2" />}
                          {editingItem ? 'Simpan Perubahan' : 'Tambah Menu'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-200"
                          onClick={() => {
                            setShowItemForm(false);
                            setEditingItem(null);
                            clearImage();
                            setPriceDisplay('');
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {loadingItems ? (
                <LoadingCard />
              ) : menuItemsList.length === 0 ? (
                <Card className="border-slate-200 border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <UtensilsCrossed className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Belum Ada Menu</h3>
                    <p className="text-slate-500 mb-4">Mulai tambahkan menu item untuk outlet ini</p>
                    <Button 
                      onClick={() => setShowItemForm(true)} 
                      className="bg-gradient-to-r from-slate-800 to-slate-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Item
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {menuItemsList.map((item: IMenuItem) => (
                    <Card key={item._id} className={`group border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden ${item.isAvailable === false ? 'opacity-60' : ''}`}>
                      {/* Image section */}
                      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-50">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed className="h-12 w-12 text-slate-300" />
                          </div>
                        )}
                        {/* Price badge */}
                        <div className="absolute bottom-3 right-3">
                          <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur shadow-sm font-bold text-slate-900">
                            {formatCurrency(item.basePrice)}
                          </span>
                        </div>
                        {/* Stock/Availability badge */}
                        {item.isAvailable === false && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                              HABIS
                            </span>
                          </div>
                        )}
                        {item.stock !== null && item.stock !== undefined && item.isAvailable !== false && (
                          <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.stock <= 5 ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                              Stok: {item.stock}
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
                            {item.description || 'Tidak ada deskripsi'}
                          </p>
                        </div>

                        {/* Stock controls */}
                        <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateStockMutation.mutate({
                                  id: item._id,
                                  data: { isAvailable: !item.isAvailable }
                                })}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  item.isAvailable !== false
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                              >
                                {item.isAvailable !== false ? '✓ Tersedia' : '✕ Habis'}
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                placeholder="∞"
                                defaultValue={item.stock ?? ''}
                                className="w-16 h-7 px-2 text-xs border rounded dark:bg-slate-600 dark:border-slate-500 dark:text-white text-center"
                                onBlur={(e) => {
                                  const val = e.target.value;
                                  const newStock = val === '' ? null : parseInt(val);
                                  if (newStock !== item.stock) {
                                    updateStockMutation.mutate({
                                      id: item._id,
                                      data: { stock: newStock }
                                    });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                              />
                              <span className="text-xs text-slate-500 dark:text-slate-400">stok</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-600">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700" 
                            onClick={() => {
                              setEditingItem(item);
                              setPriceDisplay(formatRupiahInput(item.basePrice.toString()));
                            }}
                          >
                            <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 dark:border-slate-600 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800"
                            onClick={() => {
                              if (confirm('Hapus menu ini?')) {
                                deleteItemMutation.mutate(item._id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addons Tab */}
          {activeTab === 'addons' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    setShowAddonForm(true);
                    setAddonPriceDisplay('');
                  }}
                  className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Addon
                </Button>
              </div>

              {showAddonForm && (
                <Card className="border-slate-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">Tambah Addon Baru</h2>
                    <p className="text-slate-300 text-sm">Addon dapat ditambahkan ke menu item</p>
                  </div>
                  <CardContent className="pt-6">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        createAddonMutation.mutate({
                          outletId: selectedOutletId,
                          name: formData.get('name') as string,
                          price: parseRupiahInput(addonPriceDisplay),
                        });
                      }}
                      className="flex flex-col md:flex-row gap-4 items-end"
                    >
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Nama Addon <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input name="name" placeholder="Contoh: Extra Keju, Telur Mata Sapi" className="pl-10 border-slate-200" required />
                        </div>
                      </div>
                      <div className="w-full md:w-48 space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Harga <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">Rp</span>
                          <Input 
                            name="price" 
                            placeholder="0"
                            value={addonPriceDisplay}
                            onChange={(e) => setAddonPriceDisplay(formatRupiahInput(e.target.value))}
                            className="pl-10 border-slate-200 font-mono" 
                            required 
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={createAddonMutation.isPending} className="bg-gradient-to-r from-slate-800 to-slate-700">
                          {createAddonMutation.isPending && <Spinner size="sm" className="mr-2" />}
                          Simpan
                        </Button>
                        <Button type="button" variant="outline" className="border-slate-200" onClick={() => setShowAddonForm(false)}>
                          Batal
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {loadingAddons ? (
                <LoadingCard />
              ) : addonsList.length === 0 ? (
                <Card className="border-slate-200 border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Belum Ada Addon</h3>
                    <p className="text-slate-500 mb-4">Buat addon untuk menambah variasi menu</p>
                    <Button onClick={() => setShowAddonForm(true)} className="bg-gradient-to-r from-slate-800 to-slate-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Addon
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {addonsList.map((addon: IAddon) => (
                    <Card key={addon._id} className="group border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                            <Package className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">{addon.name}</span>
                            <p className="text-sm font-medium text-emerald-600">+{formatCurrency(addon.price)}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (confirm('Hapus addon ini?')) {
                              deleteAddonMutation.mutate(addon._id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
