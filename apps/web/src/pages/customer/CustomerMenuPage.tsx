import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publicApi } from '@/api';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCard, Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import {
  Plus, Minus, ShoppingCart, Search, ArrowLeft,
  Store, UtensilsCrossed, CreditCard, Banknote, QrCode,
  MapPin, User, CheckCircle, AlertCircle,
  ChevronRight, X, ShoppingBag
} from 'lucide-react';
import { IMenuItem, ICategory, PaymentMethod, IOutlet } from '@orixa/shared';
import { formatCurrency } from '@/lib/utils';

export default function CustomerMenuPage() {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [note, setNote] = useState('');

  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  // Resolve QR token to get outlet/table info
  const { data: resolved, isLoading: loadingResolve, error: resolveError } = useQuery({
    queryKey: ['resolve', qrToken],
    queryFn: () => publicApi.resolveQR(qrToken!),
    enabled: !!qrToken,
    retry: 1,
  });

  const outlet: IOutlet | undefined = resolved?.data?.outlet;
  const table = resolved?.data?.table;
  const company = resolved?.data?.company;

  // Get menu items
  const { data: menu, isLoading: loadingMenu } = useQuery({
    queryKey: ['public-menu', outlet?._id],
    queryFn: () => publicApi.getMenu(outlet?._id!),
    enabled: !!outlet?._id,
  });

  const categories: ICategory[] = menu?.data?.categories || [];
  const menuItems: IMenuItem[] = menu?.data?.items || [];

  // Set default payment method from outlet settings
  useEffect(() => {
    if (outlet?.settings?.paymentConfig?.enabledMethods?.length) {
      setSelectedPayment(outlet.settings.paymentConfig.enabledMethods[0]);
    }
  }, [outlet]);

  // Create order mutation - Now order + payment created in one API call
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await publicApi.createOrder(orderData);
      // Response now contains { order, outlet, payment, paymentInstructions }
      const data = response.data?.data || response.data;
      return data;
    },
    onSuccess: (data) => {
      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      // Navigate to tracking page with order ID
      const orderId = data?.order?._id || data?._id;
      if (orderId) {
        navigate(`/t/${orderId}`);
      }
    },
    onError: (error: any) => {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan');
    },
  });

  // Loading state
  if (loadingResolve) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Memuat menu...</p>
        </div>
      </div>
    );
  }

  // Error state - invalid QR
  if (resolveError || !outlet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">QR Code Tidak Valid</h2>
            <p className="text-slate-600 mb-6">
              QR code ini tidak dikenali atau sudah tidak aktif. 
              Silakan scan ulang atau hubungi staff.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredItems = menuItems.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isAvailableForOrder = item.isActive && item.isAvailable !== false;
    return matchCategory && matchSearch && isAvailableForOrder;
  });

  const enabledPaymentMethods = outlet.settings?.paymentConfig?.enabledMethods || [PaymentMethod.CASH];

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    if (!selectedPayment) {
      toast.error('Pilih metode pembayaran');
      return;
    }

    const orderData = {
      outletId: outlet._id,
      tableId: table?._id,
      qrToken: qrToken,
      items: items.map((item) => ({
        menuItemId: item.menuItem._id,
        qty: item.quantity,
        note: item.note || undefined,
      })),
      customer: {
        name: customerName || undefined,
        phone: customerPhone || undefined,
      },
      note: note || undefined,
      paymentMethod: selectedPayment, // Include payment method
    };

    createOrderMutation.mutate(orderData);
  };

  const subtotal = getTotal();
  const taxRate = outlet.settings?.taxRate || 0;
  const serviceRate = outlet.settings?.serviceRate || 0;
  const tax = subtotal * (taxRate / 100);
  const service = subtotal * (serviceRate / 100);
  const total = subtotal + tax + service;

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // ============ CHECKOUT VIEW ============
  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 p-4">
            <Button variant="ghost" size="icon" onClick={() => setShowCheckout(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Checkout</h1>
              <p className="text-sm text-slate-500">{outlet.name}</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4 pb-32">
          {/* Table Info */}
          {table && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Meja</p>
                <p className="font-bold text-blue-800 text-lg">{table.name}</p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <Card className="shadow-md">
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                Ringkasan Pesanan
              </h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.menuItem._id} className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{item.menuItem.name}</p>
                      <p className="text-sm text-slate-500">{item.quantity} × {formatCurrency(item.menuItem.basePrice)}</p>
                    </div>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(item.menuItem.basePrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Pajak ({taxRate}%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                )}
                {serviceRate > 0 && (
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Service ({serviceRate}%)</span>
                    <span>{formatCurrency(service)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 text-slate-800">
                  <span>Total</span>
                  <span className="text-emerald-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="shadow-md">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informasi Anda (Opsional)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Nama</label>
                  <Input
                    placeholder="Nama Anda"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">No. WhatsApp</label>
                  <Input
                    placeholder="08xxxxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Catatan Pesanan</label>
                  <Input
                    placeholder="Contoh: Tidak pedas, pisahkan saus"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-md">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Metode Pembayaran
              </h3>
              <div className="space-y-2">
                {enabledPaymentMethods.includes(PaymentMethod.CASH) && (
                  <button
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      selectedPayment === PaymentMethod.CASH
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedPayment(PaymentMethod.CASH)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedPayment === PaymentMethod.CASH ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-800">Bayar di Kasir</p>
                      <p className="text-sm text-slate-500">Bayar langsung dengan uang tunai</p>
                    </div>
                    {selectedPayment === PaymentMethod.CASH && (
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    )}
                  </button>
                )}
                
                {enabledPaymentMethods.includes(PaymentMethod.TRANSFER) && (
                  <button
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      selectedPayment === PaymentMethod.TRANSFER
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedPayment(PaymentMethod.TRANSFER)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedPayment === PaymentMethod.TRANSFER ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-800">Transfer Bank</p>
                      <p className="text-sm text-slate-500">Bayar via transfer bank</p>
                    </div>
                    {selectedPayment === PaymentMethod.TRANSFER && (
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    )}
                  </button>
                )}
                
                {enabledPaymentMethods.includes(PaymentMethod.QR) && (
                  <button
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      selectedPayment === PaymentMethod.QR
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedPayment(PaymentMethod.QR)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedPayment === PaymentMethod.QR ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-800">QRIS</p>
                      <p className="text-sm text-slate-500">Scan QR untuk bayar</p>
                    </div>
                    {selectedPayment === PaymentMethod.QR && (
                      <CheckCircle className="h-6 w-6 text-purple-500" />
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <Button
            size="lg"
            className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            onClick={handleCheckout}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Memproses...
              </>
            ) : (
              <>
                Pesan Sekarang - {formatCurrency(total)}
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ============ CART VIEW ============
  if (showCart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 p-4">
            <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Keranjang Saya</h1>
              <p className="text-sm text-slate-500">{cartItemCount} item</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4 pb-32">
          {items.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="py-12 text-center">
                <ShoppingCart className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">Keranjang kosong</p>
                <p className="text-slate-400 text-sm mt-1">Yuk pilih menu favorit kamu</p>
                <Button className="mt-6" onClick={() => setShowCart(false)}>
                  Lihat Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {items.map((item) => (
                <Card key={item.menuItem._id} className="shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      {item.menuItem.imageUrl ? (
                        <img 
                          src={item.menuItem.imageUrl} 
                          alt={item.menuItem.name} 
                          className="w-24 h-24 object-cover rounded-xl" 
                        />
                      ) : (
                        <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center">
                          <UtensilsCrossed className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">{item.menuItem.name}</h4>
                        <p className="text-emerald-600 font-bold mt-1">
                          {formatCurrency(item.menuItem.basePrice)}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:bg-red-100 hover:text-red-600" 
                              onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold w-8 text-center">{item.quantity}</span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:bg-emerald-100 hover:text-emerald-600" 
                              onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item.menuItem._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="font-bold text-slate-800">
                          {formatCurrency(item.menuItem.basePrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Subtotal Card */}
              <Card className="shadow-md bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-sm">Subtotal</p>
                      <p className="text-2xl font-bold">{formatCurrency(subtotal)}</p>
                    </div>
                    <ShoppingBag className="h-8 w-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Fixed Bottom Button */}
        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
              onClick={() => setShowCheckout(true)}
            >
              Lanjut ke Checkout
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ============ MAIN MENU VIEW ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl">{outlet.name}</h1>
            <p className="text-blue-200 text-sm">{company?.name}</p>
          </div>
        </div>
        
        {table && (
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
            <MapPin className="h-5 w-5" />
            <div>
              <p className="text-blue-100 text-xs">Anda di meja</p>
              <p className="font-bold text-lg">{table.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search & Categories */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Cari menu..." 
              className="pl-12 h-12 bg-slate-50 border-0 text-base" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-1 px-1">
            <Button 
              size="sm" 
              variant={selectedCategory === 'all' ? 'default' : 'outline'} 
              onClick={() => setSelectedCategory('all')} 
              className="shrink-0 rounded-full"
            >
              Semua
            </Button>
            {categories.map((cat) => (
              <Button 
                key={cat._id} 
                size="sm" 
                variant={selectedCategory === cat._id ? 'default' : 'outline'} 
                onClick={() => setSelectedCategory(cat._id)} 
                className="shrink-0 rounded-full"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        {loadingMenu ? (
          <LoadingCard />
        ) : filteredItems.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Menu tidak ditemukan</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const cartItem = items.find((i) => i.menuItem._id === item._id);
              return (
                <Card key={item._id} className="shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Image */}
                      <div className="w-28 h-28 flex-shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <UtensilsCrossed className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-emerald-600 font-bold text-lg">
                            {formatCurrency(item.basePrice)}
                          </p>
                          
                          {cartItem ? (
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8" 
                                onClick={() => updateQuantity(item._id, cartItem.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-bold w-6 text-center">{cartItem.quantity}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8" 
                                onClick={() => updateQuantity(item._id, cartItem.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="rounded-full" 
                              onClick={() => addItem(item)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Tambah
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent pt-8">
          <Button 
            size="lg" 
            className="w-full h-14 shadow-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl" 
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            <span className="flex-1 text-left">Lihat Keranjang ({cartItemCount})</span>
            <span className="font-bold">{formatCurrency(subtotal)}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
