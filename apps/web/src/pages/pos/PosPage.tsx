import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posApi, menuItemsApi, categoriesApi, outletsApi, paymentsApi, tablesApi } from '@/api';
import { useCartStore } from '@/store/cart';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCard } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { 
  Plus, Minus, Trash2, ShoppingCart, Search, 
  CreditCard, Banknote, QrCode, Check,
  Clock, UtensilsCrossed, MapPin, Printer, X,
  ClipboardList, Volume2, Edit3, User, Phone,
  Smartphone, RefreshCw, Eye, CheckCircle
} from 'lucide-react';
import { IMenuItem, ICategory, IOutlet, PaymentMethod, OrderStatus, PaymentStatus, IOrder } from '@orixa/shared';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

// Receipt Component for printing
const Receipt = ({ order, outlet, table }: { order: any; outlet: IOutlet | undefined; table: any }) => {
  return (
    <div className="p-4 bg-white text-black text-sm font-mono" style={{ width: '300px' }}>
      <div className="text-center mb-4">
        <h2 className="font-bold text-lg">{outlet?.name || 'ORIXA POS'}</h2>
        <p className="text-xs">{outlet?.address}</p>
        {outlet?.phone && <p className="text-xs">Tel: {outlet.phone}</p>}
      </div>
      
      <div className="border-t border-dashed border-black pt-2 mb-2">
        <div className="flex justify-between text-xs">
          <span>No: #{order.orderCode}</span>
          <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
        </div>
        {table && <p className="text-xs">Meja: {table.name}</p>}
        {order.customer?.name && <p className="text-xs">Customer: {order.customer.name}</p>}
      </div>
      
      <div className="border-t border-dashed border-black py-2">
        {order.items?.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between mb-1">
            <div className="flex-1">
              <span>{item.qty}x {item.nameSnapshot}</span>
              {item.note && <p className="text-xs text-gray-600 ml-4">Note: {item.note}</p>}
            </div>
            <span>{formatCurrency(item.lineTotal)}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-dashed border-black py-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.tax > 0 && (
          <div className="flex justify-between text-xs">
            <span>Pajak</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
        )}
        {order.service > 0 && (
          <div className="flex justify-between text-xs">
            <span>Service</span>
            <span>{formatCurrency(order.service)}</span>
          </div>
        )}
        {order.discount > 0 && (
          <div className="flex justify-between text-xs">
            <span>Diskon</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t border-black pt-1">
          <span>TOTAL</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
      
      <div className="border-t border-dashed border-black pt-2 text-center">
        <p className="text-xs">Pembayaran: {order.paymentMethod || 'CASH'}</p>
        <p className="text-xs font-bold">
          Status: {order.paymentStatus === PaymentStatus.PAID ? 'LUNAS' : 'BELUM LUNAS'}
        </p>
      </div>
      
      <div className="text-center mt-4 text-xs">
        <p>Terima Kasih</p>
        <p>Powered by ORIXA</p>
      </div>
    </div>
  );
};

export default function PosPage() {
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'qr-orders'>('menu'); // Tab: menu, orders, qr-orders
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  // Use order notifications for realtime updates
  useOrderNotifications({
    outletId: selectedOutletId,
    onNewOrder: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-qr-orders'] });
    },
    onOrderStatusUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-qr-orders'] });
    },
    onPaymentUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-qr-orders'] });
    },
  });

  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', selectedOutletId],
    queryFn: () => categoriesApi.getAll({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId,
  });

  const { data: menuItems, isLoading: loadingMenu } = useQuery({
    queryKey: ['menu-items', selectedOutletId],
    queryFn: () => menuItemsApi.getAll({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId,
  });

  const { data: tables } = useQuery({
    queryKey: ['tables', selectedOutletId],
    queryFn: () => tablesApi.getAll({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['pos-orders', selectedOutletId],
    queryFn: () => posApi.getOrders({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId && activeTab === 'orders',
    refetchInterval: 10000,
  });

  // Query specifically for QR orders (pending payments)
  const { data: qrOrders, isLoading: loadingQrOrders, refetch: refetchQrOrders } = useQuery({
    queryKey: ['pos-qr-orders', selectedOutletId],
    queryFn: () => posApi.getOrders({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId && activeTab === 'qr-orders',
    refetchInterval: 5000, // More frequent for QR orders
  });

  // Fix outlets data access
  const outletsArray = outlets?.data?.data || outlets?.data || [];
  const categoriesArray = categories?.data?.data || categories?.data || [];
  const menuItemsArray = menuItems?.data?.data || menuItems?.data || [];
  const tablesArray = tables?.data?.data || tables?.data || [];
  const ordersArray = orders?.data?.data || orders?.data || [];
  const qrOrdersArray = qrOrders?.data?.data || qrOrders?.data || [];

  // Filter QR orders that need confirmation (PENDING payment)
  const pendingQrOrders = qrOrdersArray.filter((o: IOrder) => 
    o.channel === 'QR' && 
    o.paymentStatus === PaymentStatus.PENDING &&
    o.status !== OrderStatus.CANCELLED
  );

  const outlet = outletsArray.find((o: IOutlet) => o._id === selectedOutletId);
  const enabledPaymentMethods = outlet?.settings?.paymentConfig?.enabledMethods || [PaymentMethod.CASH];

  const createOrderMutation = useMutation({
    mutationFn: posApi.createOrder,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      const orderData = response.data?.data || response.data;
      setCreatedOrder(orderData);
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setSelectedTableId('');
      setShowPayment(false);
      // Show receipt modal after order created
      setShowReceiptModal(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat order');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      posApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      toast.success('Status order diupdate');
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (orderId: string) => paymentsApi.confirmByOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      toast.success('Pembayaran dikonfirmasi');
      if (createdOrder) {
        setCreatedOrder({ ...createdOrder, paymentStatus: PaymentStatus.PAID });
      }
    },
  });

  // Set default outlet
  useEffect(() => {
    if (outletsArray.length && !selectedOutletId) {
      const firstOutlet = user?.outletIds?.length 
        ? outletsArray.find((o: IOutlet) => user.outletIds?.includes(o._id))
        : outletsArray[0];
      if (firstOutlet) {
        setSelectedOutletId(firstOutlet._id);
      }
    }
  }, [outletsArray, user, selectedOutletId]);

  const filteredItems = menuItemsArray.filter((item: IMenuItem) => {
    const matchCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isAvailableForOrder = item.isActive && item.isAvailable !== false;
    return matchCategory && matchSearch && isAvailableForOrder;
  });

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = (markAsPaid: boolean) => {
    if (!selectedPaymentMethod || items.length === 0) return;

    createOrderMutation.mutate({
      outletId: selectedOutletId,
      tableId: selectedTableId || undefined,
      items: items.map((item) => ({
        menuItemId: item.menuItem._id,
        qty: item.quantity,
        note: item.note,
      })),
      customer: {
        type: 'GUEST',
        name: customerName || undefined,
        phone: customerPhone || undefined,
      },
      paymentMethod: selectedPaymentMethod,
      markAsPaid,
    });
    setShowPaymentModal(false);
  };

  const handlePrintReceipt = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocker aktif. Izinkan popup untuk mencetak.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk - ${createdOrder?.orderCode}</title>
          <style>
            body { font-family: monospace; margin: 0; padding: 0; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleViewOrderReceipt = (order: IOrder) => {
    setCreatedOrder(order);
    setShowReceiptModal(true);
  };

  const subtotal = getTotal();
  const taxRate = outlet?.settings?.taxRate || 0;
  const serviceRate = outlet?.settings?.serviceRate || 0;
  const tax = subtotal * (taxRate / 100);
  const service = subtotal * (serviceRate / 100);
  const total = subtotal + tax + service;

  const selectedTable = tablesArray.find((t: any) => t._id === selectedTableId);

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4">
      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {selectedPaymentMethod === PaymentMethod.CASH && <Banknote className="h-5 w-5" />}
                {selectedPaymentMethod === PaymentMethod.TRANSFER && <CreditCard className="h-5 w-5" />}
                {selectedPaymentMethod === PaymentMethod.QR && <QrCode className="h-5 w-5" />}
                Konfirmasi Pembayaran
              </h3>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Pembayaran</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(total)}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-full ${
                    selectedPaymentMethod === PaymentMethod.CASH ? 'bg-green-100 text-green-600' :
                    selectedPaymentMethod === PaymentMethod.TRANSFER ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {selectedPaymentMethod === PaymentMethod.CASH && <Banknote className="h-5 w-5" />}
                    {selectedPaymentMethod === PaymentMethod.TRANSFER && <CreditCard className="h-5 w-5" />}
                    {selectedPaymentMethod === PaymentMethod.QR && <QrCode className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold dark:text-white">
                      {selectedPaymentMethod === PaymentMethod.CASH && 'Pembayaran Tunai'}
                      {selectedPaymentMethod === PaymentMethod.TRANSFER && 'Transfer Bank'}
                      {selectedPaymentMethod === PaymentMethod.QR && 'QRIS'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPaymentMethod === PaymentMethod.CASH && 'Terima uang tunai dari pelanggan'}
                      {selectedPaymentMethod === PaymentMethod.TRANSFER && 'Tunggu konfirmasi transfer'}
                      {selectedPaymentMethod === PaymentMethod.QR && 'Scan QR untuk pembayaran'}
                    </p>
                  </div>
                </div>

                {selectedTableId && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>Meja: {selectedTable?.name}</span>
                  </div>
                )}
                {customerName && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Customer: {customerName}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {selectedPaymentMethod === PaymentMethod.CASH ? (
                  <Button
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleConfirmPayment(true)}
                    disabled={createOrderMutation.isPending}
                  >
                    <Check className="mr-2 h-5 w-5" />
                    {createOrderMutation.isPending ? 'Memproses...' : 'Sudah Bayar / Lunas'}
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleConfirmPayment(true)}
                      disabled={createOrderMutation.isPending}
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Sudah Bayar / Lunas
                    </Button>
                    <Button
                      className="w-full h-12"
                      variant="outline"
                      onClick={() => handleConfirmPayment(false)}
                      disabled={createOrderMutation.isPending}
                    >
                      <Clock className="mr-2 h-5 w-5" />
                      Buat Order (Pending)
                    </Button>
                  </>
                )}
                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Order Modal - For cashier to read back order */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-4 sm:p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Konfirmasi Pesanan</h3>
                    <p className="text-blue-100 text-sm sm:text-base mt-0.5">Bacakan ke pelanggan sebelum checkout</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              {/* Customer Info Pills */}
              {(customerName || selectedTableId || customerPhone) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedTableId && (
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      <MapPin className="h-4 w-4" />
                      <span>Meja {tablesArray.find((t: any) => t._id === selectedTableId)?.name}</span>
                    </div>
                  )}
                  {customerName && (
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      <User className="h-4 w-4" />
                      <span>{customerName}</span>
                    </div>
                  )}
                  {customerPhone && (
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      <Phone className="h-4 w-4" />
                      <span>{customerPhone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Script hint */}
            <div className="px-4 sm:px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Volume2 className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm italic">"Baik Kak, saya ulangi pesanannya ya..."</span>
              </div>
            </div>

            {/* Order Items - Scrollable */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900">
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div 
                    key={item.menuItem._id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      {/* Number Badge */}
                      <div className="w-12 sm:w-16 bg-gradient-to-b from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xl sm:text-2xl">{index + 1}</span>
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          {/* Name & Price */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white truncate">
                              {item.menuItem.name}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                              @ {formatCurrency(item.menuItem.basePrice)}
                            </p>
                          </div>
                          
                          {/* Quantity & Total */}
                          <div className="flex items-center gap-3 sm:gap-4">
                            {/* Quantity Badge */}
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-lg hidden sm:inline">×</span>
                              <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-lg sm:text-xl min-w-[50px] text-center">
                                {item.quantity}
                              </div>
                            </div>
                            
                            {/* Line Total */}
                            <div className="text-right min-w-[90px] sm:min-w-[110px]">
                              <p className="font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(item.menuItem.basePrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Item Count Summary */}
              <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <ShoppingCart className="h-4 w-4" />
                  Total {items.reduce((sum, item) => sum + item.quantity, 0)} item
                </span>
              </div>
            </div>

            {/* Summary Footer */}
            <div className="border-t-2 border-slate-200 dark:border-slate-700">
              {/* Price Breakdown */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                    <span>Pajak ({taxRate}%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                )}
                {serviceRate > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                    <span>Service ({serviceRate}%)</span>
                    <span>{formatCurrency(service)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-emerald-500 to-teal-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-emerald-100 text-sm">Total Pembayaran</p>
                    <p className="text-white font-bold text-sm">"{formatCurrency(total)} ya Kak"</p>
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-900 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 sm:h-12 order-2 sm:order-1 bg-white dark:bg-slate-800"
                  onClick={() => setShowReviewModal(false)}
                >
                  <Edit3 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Ubah Pesanan
                </Button>
                <Button
                  className="flex-1 h-12 sm:h-14 order-1 sm:order-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-base sm:text-lg shadow-lg"
                  onClick={() => {
                    setShowReviewModal(false);
                    setShowPayment(true);
                  }}
                >
                  <Check className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  Konfirmasi & Bayar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && createdOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Check className="h-5 w-5" />
                Order Berhasil!
              </h3>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-auto">
              <div ref={receiptRef}>
                <Receipt 
                  order={createdOrder} 
                  outlet={outlet}
                  table={tablesArray.find((t: any) => t._id === createdOrder.tableId)}
                />
              </div>
            </div>

            <div className="p-4 border-t dark:border-slate-700 space-y-2">
              {createdOrder.paymentStatus !== PaymentStatus.PAID && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => confirmPaymentMutation.mutate(createdOrder._id)}
                  disabled={confirmPaymentMutation.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Konfirmasi Lunas
                </Button>
              )}
              <Button
                className="w-full"
                variant="outline"
                onClick={handlePrintReceipt}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Struk
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                onClick={() => {
                  setShowReceiptModal(false);
                  setCreatedOrder(null);
                }}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Left: Menu */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex gap-4 mb-4">
          <select
            className="w-48 h-10 border rounded-md px-3 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            value={selectedOutletId}
            onChange={(e) => setSelectedOutletId(e.target.value)}
          >
            {outletsArray.map((outlet: IOutlet) => (
              <option key={outlet._id} value={outlet._id}>
                {outlet.name}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari menu..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            <Button
              size="sm"
              variant={activeTab === 'menu' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('menu')}
              className={activeTab === 'menu' ? '' : 'text-slate-600 dark:text-slate-300'}
            >
              <UtensilsCrossed className="mr-1 h-4 w-4" />
              Menu
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'qr-orders' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('qr-orders')}
              className={`relative ${activeTab === 'qr-orders' ? 'bg-amber-500 hover:bg-amber-600' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <Smartphone className="mr-1 h-4 w-4" />
              QR Orders
              {pendingQrOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {pendingQrOrders.length}
                </span>
              )}
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('orders')}
              className={activeTab === 'orders' ? '' : 'text-slate-600 dark:text-slate-300'}
            >
              <Clock className="mr-1 h-4 w-4" />
              Semua
            </Button>
          </div>
        </div>

        {/* Categories - Only show on menu tab */}
        {activeTab === 'menu' && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              Semua
            </Button>
            {categoriesArray.map((cat: ICategory) => (
              <Button
                key={cat._id}
                size="sm"
                variant={selectedCategory === cat._id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat._id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'qr-orders' ? (
          /* QR Orders Tab - Dedicated for confirming QR payments */
          <div className="flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg dark:text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-amber-500" />
                  Pesanan dari QR Meja
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Konfirmasi pembayaran untuk pesanan customer
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchQrOrders()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {loadingQrOrders ? (
              <LoadingCard />
            ) : pendingQrOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
                <CheckCircle className="h-16 w-16 mb-4 text-green-500/50" />
                <p className="text-lg font-medium">Tidak ada pesanan QR menunggu</p>
                <p className="text-sm">Semua pembayaran sudah dikonfirmasi</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingQrOrders.map((order: any) => {
                  const orderTable = tablesArray.find((t: any) => t._id === order.tableId);
                  return (
                    <Card 
                      key={order._id} 
                      className="border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
                    >
                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
                              <Smartphone className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                                #{order.orderCode}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                {orderTable && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                                    <MapPin className="h-3 w-3" />
                                    Meja {orderTable.name}
                                  </span>
                                )}
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Payment Method Badge */}
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                              order.paymentMethod === PaymentMethod.CASH || order.items?.[0]?.paymentMethod === 'CASH'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : order.paymentMethod === PaymentMethod.TRANSFER
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            }`}>
                              {order.paymentMethod === PaymentMethod.CASH && <><Banknote className="h-4 w-4" /> Cash</>}
                              {order.paymentMethod === PaymentMethod.TRANSFER && <><CreditCard className="h-4 w-4" /> Transfer</>}
                              {order.paymentMethod === PaymentMethod.QR && <><QrCode className="h-4 w-4" /> QRIS</>}
                              {!order.paymentMethod && 'Belum dipilih'}
                            </span>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                              ⏳ Menunggu Konfirmasi
                            </p>
                          </div>
                        </div>

                        {/* Customer Info */}
                        {(order.customer?.name || order.customer?.phone) && (
                          <div className="flex items-center gap-4 mb-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300">
                              {order.customer?.name || 'Guest'}
                            </span>
                            {order.customer?.phone && (
                              <>
                                <Phone className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-700 dark:text-slate-300">{order.customer.phone}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mb-4">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                            Detail Pesanan
                          </p>
                          <div className="space-y-2">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                                    {item.qty}x
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-200">{item.nameSnapshot}</span>
                                </div>
                                <span className="text-slate-600 dark:text-slate-400">{formatCurrency(item.lineTotal)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total & Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-amber-200 dark:border-amber-700">
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Pembayaran</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                              {formatCurrency(order.total)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleViewOrderReceipt(order)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </Button>
                            <Button
                              className="bg-green-600 hover:bg-green-700 text-white px-6"
                              onClick={() => confirmPaymentMutation.mutate(order._id)}
                              disabled={confirmPaymentMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Konfirmasi Lunas
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'orders' ? (
          /* All Orders Tab */
          <div className="flex-1 overflow-auto">
            <h3 className="font-semibold mb-4 dark:text-white">Semua Order Aktif</h3>
            {loadingOrders ? (
              <LoadingCard />
            ) : (
              <div className="space-y-3">
                {ordersArray
                  .filter((o: IOrder) => o.status !== OrderStatus.CLOSED)
                  .sort((a: IOrder, b: IOrder) => {
                    if (a.paymentStatus === PaymentStatus.PENDING && b.paymentStatus !== PaymentStatus.PENDING) return -1;
                    if (b.paymentStatus === PaymentStatus.PENDING && a.paymentStatus !== PaymentStatus.PENDING) return 1;
                    return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
                  })
                  .map((order: IOrder) => (
                  <Card 
                    key={order._id} 
                    className={`dark:bg-slate-800 dark:border-slate-700 ${
                      order.paymentStatus === PaymentStatus.PENDING && order.channel === 'QR' 
                        ? 'border-2 border-amber-400 dark:border-amber-500' 
                        : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold dark:text-white">#{order.orderCode}</span>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            order.channel === 'QR' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {order.channel === 'QR' ? '📱 QR' : '🖥️ POS'}
                          </span>
                          {order.tableId && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Meja {tablesArray.find((t: any) => t._id === order.tableId)?.name || order.tableId}
                            </span>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {order.customer?.name || 'Guest'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === OrderStatus.NEW ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                            order.status === OrderStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            order.status === OrderStatus.READY ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {order.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.paymentStatus === PaymentStatus.PAID ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            order.paymentStatus === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {order.paymentStatus === PaymentStatus.PAID ? '✓ LUNAS' : 
                             order.paymentStatus === PaymentStatus.PENDING ? '⏳ PENDING' : 'UNPAID'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {order.items?.map((item: any) => (
                          <div key={item.menuItemId}>{item.qty}x {item.nameSnapshot}</div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t dark:border-slate-600">
                        <span className="font-semibold dark:text-white">{formatCurrency(order.total)}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewOrderReceipt(order)}
                          >
                            <Printer className="h-3 w-3 mr-1" />
                            Struk
                          </Button>
                          {order.paymentStatus !== PaymentStatus.PAID && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => confirmPaymentMutation.mutate(order._id)}
                              disabled={confirmPaymentMutation.isPending}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Konfirmasi Bayar
                            </Button>
                          )}
                          {order.status === OrderStatus.READY && order.paymentStatus === PaymentStatus.PAID && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ 
                                orderId: order._id, 
                                status: OrderStatus.SERVED 
                              })}
                            >
                              Served
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Menu Tab */
          <div className="flex-1 overflow-auto">
            {loadingMenu ? (
              <LoadingCard />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredItems?.map((item: IMenuItem) => (
                  <Card
                    key={item._id}
                    className="cursor-pointer hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700"
                    onClick={() => addItem(item)}
                  >
                    <CardContent className="p-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 dark:bg-slate-700 rounded mb-2 flex items-center justify-center">
                          <UtensilsCrossed className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <h4 className="font-medium text-sm line-clamp-2 dark:text-white">{item.name}</h4>
                      <p className="text-primary font-bold mt-1">
                        {formatCurrency(item.basePrice)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Cart - Improved UI */}
      <div className="w-96 bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl flex flex-col shadow-xl">
        {/* Cart Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-lg">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <ShoppingCart className="h-6 w-6" />
            Keranjang Belanja
            {items.length > 0 && (
              <span className="ml-auto bg-white text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                {items.reduce((sum, item) => sum + item.quantity, 0)} item
              </span>
            )}
          </h3>
        </div>

        {/* Cart Items - Better visibility */}
        <div className="flex-1 overflow-auto p-3 bg-slate-50 dark:bg-slate-900">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <ShoppingCart className="h-16 w-16 mb-3 opacity-30" />
              <p className="text-lg font-medium">Keranjang kosong</p>
              <p className="text-sm">Pilih menu untuk menambahkan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div 
                  key={item.menuItem._id} 
                  className="bg-white dark:bg-slate-800 rounded-lg p-3 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Item number badge */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Item name - larger and bolder */}
                      <h4 className="font-bold text-base text-slate-800 dark:text-white truncate">
                        {item.menuItem.name}
                      </h4>
                      
                      {/* Price per unit */}
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        @ {formatCurrency(item.menuItem.basePrice)}
                      </p>
                      
                      {/* Line total - highlighted */}
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-base mt-1">
                        {formatCurrency(item.menuItem.basePrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quantity controls - larger buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-slate-700">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                        onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-xl dark:text-white">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900"
                        onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={() => removeItem(item.menuItem._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Info - Compact */}
        <div className="p-3 border-t dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="w-full h-9 pl-8 pr-2 rounded-md border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
              >
                <option value="">Pilih Meja</option>
                {tablesArray.filter((t: any) => t.isActive).map((table: any) => (
                  <option key={table._id} value={table._id}>Meja {table.name}</option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Nama customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <Input
            placeholder="No HP (opsional)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        {/* Summary - More prominent */}
        <div className="p-4 border-t-2 border-emerald-200 dark:border-emerald-700 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between dark:text-gray-300">
              <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Pajak ({taxRate}%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}
            {serviceRate > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Service ({serviceRate}%)</span>
                <span>{formatCurrency(service)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-slate-300 dark:border-slate-600">
              <span className="text-lg font-bold dark:text-white">TOTAL</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Buttons - Larger */}
        <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
          {showPayment ? (
            <>
              <p className="text-sm font-medium mb-2 dark:text-white">Pilih Metode Pembayaran:</p>
              {enabledPaymentMethods.includes(PaymentMethod.CASH) && (
                <Button
                  className="w-full h-12 justify-start bg-green-600 hover:bg-green-700 text-white text-base"
                  onClick={() => handleSelectPaymentMethod(PaymentMethod.CASH)}
                  disabled={createOrderMutation.isPending}
                >
                  <Banknote className="mr-3 h-5 w-5" />
                  Cash - Tunai
                </Button>
              )}
              {enabledPaymentMethods.includes(PaymentMethod.TRANSFER) && (
                <Button
                  className="w-full h-12 justify-start bg-blue-600 hover:bg-blue-700 text-white text-base"
                  onClick={() => handleSelectPaymentMethod(PaymentMethod.TRANSFER)}
                  disabled={createOrderMutation.isPending}
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  Transfer Bank
                </Button>
              )}
              {enabledPaymentMethods.includes(PaymentMethod.QR) && (
                <Button
                  className="w-full h-12 justify-start bg-purple-600 hover:bg-purple-700 text-white text-base"
                  onClick={() => handleSelectPaymentMethod(PaymentMethod.QR)}
                  disabled={createOrderMutation.isPending}
                >
                  <QrCode className="mr-3 h-5 w-5" />
                  QRIS
                </Button>
              )}
              <Button
                className="w-full h-10"
                variant="ghost"
                onClick={() => setShowPayment(false)}
              >
                Batal
              </Button>
            </>
          ) : (
            <>
              {/* Review Order Button - New Feature */}
              <Button
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={items.length === 0}
                onClick={() => setShowReviewModal(true)}
              >
                <ClipboardList className="mr-2 h-5 w-5" />
                Cek & Ulangi Pesanan
              </Button>
              <Button
                className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                size="lg"
                disabled={items.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <CreditCard className="mr-2 h-6 w-6" />
                Proses Pembayaran
              </Button>
              <Button
                className="w-full h-10"
                variant="outline"
                disabled={items.length === 0}
                onClick={() => clearCart()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Kosongkan Keranjang
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
