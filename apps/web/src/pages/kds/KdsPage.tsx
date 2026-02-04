import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kdsApi, outletsApi, tablesApi } from '@/api';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { 
  ChefHat, Clock, Check, RefreshCw, Bell, Store, 
  Printer, X, CheckCircle2, Play, Timer, UtensilsCrossed,
  Wifi, WifiOff, Volume2, VolumeX
} from 'lucide-react';
import { IOrder, IOutlet, OrderStatus, PaymentStatus } from '@orixa/shared';
import { useAuthStore } from '@/store/auth';

// Notification sound URLs
const NOTIFICATION_SOUNDS = {
  newOrder: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  fallback: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2FgoOBdXB0d31zZl9cYGZtcXFrYF1cXmNoamhmYF1dXmFkZ2hkYF1dX2JlaGljX11eYGNnaWljX15fYWRoaWpkYF9gY2dpamtlYWBhZGhrbGxnY2JiZmlsbm5pZWRkZ2ptb29rZ2VlZ2pucHBsaGZmaGxvcXFtaWdnaWxwcnJuamhnZ2ptcXNzb2tpaWptcXR0cGxqam1vcnV1cW1ra25xdHZ2cm5sbG9ydXd3c29tbXBzdnh4dHBubXFzdnl5dXFvbnJ0d3p6dnJwb3N2eXt7d3NxcHR3en18eHRyc3Z4fH5+eXV0dHh7fn9/e3Z1dXl8gIGAfXl2d3t+gYKCfnt4eXx/goODf318en2Ag4SEgH58e36BhIWFgX99fH+ChYaGgoB+fYCDhoiIg4F/foCEh4mJhIJ/f4GFiImJhYOAgYOGiYqKhoSBgoSHiouLh4WChIaIi4yMiIaDhYeJjI2NiYeFhYiKjY6OiomGhomLjo+PjIqHh4qMj5CQjYuIiIuNkJGRjoyJiYyOkZKSj42KiY2PkpOTkI6Li46QkpSUkY+MjI+Rk5SUkpCNjZCSlJWVk5GOjpGTlZaWlJKPj5KUlpeXlZORkJOVl5iYlpOSkZSWmJmZl5STk5WXmZqamJWUlJaYmpubmZaVlZeZm5ycmpeTlJiamZqZmJaXmZqampmXl5iZmpuamZeXmJmam5qZmJeXmZqbmpqYmJmam5uamZiYmZqbm5uamZmampubm5qamZqam5ycm5qampubm5ubm5qam5ucnJybm5ucnJycnJycnJydnZ2dnZ2dnZ6enp6enp6fn5+fn5+foKCgoKCgoKGhoaGhoaGioqKioqKio6OjoqOjo6SkpKSkpKWlpaWlpaampqampqanp6enp6eoqKioqKipqampqamqqqqqqqqqq6urq6urrKysrKysra2tra2trq6urq6ur6+vr6+vsLCwsLCwsbGxsbGxsrKysrKys7OzszA='
};

// Kitchen Ticket Component for printing
const KitchenTicket = ({ order, outlet, table }: { order: IOrder; outlet?: IOutlet; table?: any }) => {
  return (
    <div className="p-4 bg-white text-black font-mono" style={{ width: '300px' }}>
      <div className="text-center border-b-2 border-dashed border-black pb-2 mb-2">
        <h2 className="font-bold text-xl">🍳 KITCHEN ORDER</h2>
        <p className="text-sm">{outlet?.name || 'Kitchen'}</p>
      </div>
      
      <div className="border-b border-dashed border-black pb-2 mb-2">
        <div className="flex justify-between text-sm font-bold">
          <span>Order: #{order.orderCode}</span>
          <span>{new Date(order.createdAt!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {table && (
          <p className="text-lg font-bold mt-1">📍 MEJA: {table.name}</p>
        )}
        {order.customer?.name && (
          <p className="text-sm">Customer: {order.customer.name}</p>
        )}
      </div>
      
      <div className="py-2 space-y-2">
        <p className="font-bold text-sm border-b border-black pb-1">ITEMS TO PREPARE:</p>
        {order.items?.map((item: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2 py-1 border-b border-dotted border-gray-400">
            <div className="w-5 h-5 border-2 border-black flex-shrink-0 mt-0.5"></div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-bold">{item.qty}x {item.nameSnapshot}</span>
              </div>
              {item.variantSnapshot && (
                <p className="text-xs ml-2">→ {item.variantSnapshot.name}</p>
              )}
              {item.addonsSnapshot?.length > 0 && (
                <p className="text-xs ml-2">+ {item.addonsSnapshot.map((a: any) => a.name).join(', ')}</p>
              )}
              {item.note && (
                <p className="text-xs ml-2 font-bold bg-gray-200 px-1">⚠️ {item.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t-2 border-dashed border-black pt-2 mt-2 text-center">
        <p className="text-xs">Printed: {new Date().toLocaleString('id-ID')}</p>
        <p className="font-bold mt-1">✓ Check each item when done</p>
      </div>
    </div>
  );
};

export default function KdsPage() {
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const ticketRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.7;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    
    audioRef.current.src = NOTIFICATION_SOUNDS.newOrder;
    audioRef.current.play().catch(() => {
      // Try fallback sound
      if (audioRef.current) {
        audioRef.current.src = NOTIFICATION_SOUNDS.fallback;
        audioRef.current.play().catch(() => {});
      }
    });
  }, [soundEnabled]);

  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const { data: tables } = useQuery({
    queryKey: ['tables', selectedOutletId],
    queryFn: () => tablesApi.getAll({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId,
  });

  // Fix data access
  const outletsArray = outlets?.data?.data || outlets?.data || [];
  const tablesArray = tables?.data?.data || tables?.data || [];

  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['kds-orders', selectedOutletId],
    queryFn: () => kdsApi.getOrders({ outletId: selectedOutletId }),
    enabled: !!selectedOutletId,
    refetchInterval: 5000, // Refetch every 5 seconds as backup
    staleTime: 2000,
  });

  // Fix orders data access - Only show PAID orders that are not SERVED/CLOSED
  const allOrders = orders?.data?.data || orders?.data || [];
  const ordersArray = Array.isArray(allOrders) 
    ? allOrders.filter((order: IOrder) => 
        order.paymentStatus === PaymentStatus.PAID && 
        ![OrderStatus.SERVED, OrderStatus.CLOSED, OrderStatus.CANCELLED].includes(order.status)
      )
    : [];

  // Realtime order notifications
  const socket = useOrderNotifications({
    outletId: selectedOutletId,
    onNewOrder: (order) => {
      // Immediately refetch
      refetch();
      setLastUpdate(new Date());
      
      // Play sound and show alert
      if (order.paymentStatus === PaymentStatus.PAID) {
        playNotificationSound();
        setNewOrderAlert(true);
        setTimeout(() => setNewOrderAlert(false), 3000);
      }
    },
    onOrderStatusUpdated: () => {
      refetch();
      setLastUpdate(new Date());
    },
    onPaymentUpdated: (payment) => {
      // When payment is confirmed (PAID), refetch to show in KDS
      refetch();
      setLastUpdate(new Date());
      
      if (payment.status === PaymentStatus.PAID) {
        playNotificationSound();
        setNewOrderAlert(true);
        setTimeout(() => setNewOrderAlert(false), 3000);
      }
    },
    enableSound: false, // We handle sound ourselves
    enableBrowserNotification: true,
  });

  // Track socket connection status
  useEffect(() => {
    if (socket) {
      setIsConnected(socket.connected);
      
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [socket]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      kdsApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kds-orders'] });
      toast.success('Status order diupdate');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal update status');
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

  const getOrdersByStatus = (statuses: OrderStatus[]) => {
    return ordersArray.filter((order: IOrder) => statuses.includes(order.status)) || [];
  };

  const columns = [
    { 
      statuses: [OrderStatus.NEW, OrderStatus.ACCEPTED], 
      title: 'Pesanan Masuk', 
      subtitle: 'Menunggu diproses',
      color: 'border-blue-500', 
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10', 
      textColor: 'text-blue-400',
      icon: Bell,
      headerBg: 'bg-blue-600'
    },
    { 
      statuses: [OrderStatus.IN_PROGRESS], 
      title: 'Sedang Dimasak', 
      subtitle: 'Dalam proses',
      color: 'border-orange-500', 
      bgColor: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10', 
      textColor: 'text-orange-400',
      icon: Timer,
      headerBg: 'bg-orange-600'
    },
    { 
      statuses: [OrderStatus.READY], 
      title: 'Siap Diantar', 
      subtitle: 'Selesai dimasak',
      color: 'border-green-500', 
      bgColor: 'bg-gradient-to-br from-green-500/20 to-green-600/10', 
      textColor: 'text-green-400',
      icon: CheckCircle2,
      headerBg: 'bg-green-600'
    },
  ];

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handlePrintTicket = (order: IOrder) => {
    setSelectedOrder(order);
    setShowTicketModal(true);
  };

  const printTicket = () => {
    const printContent = ticketRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocker aktif. Izinkan popup untuk mencetak.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Kitchen Ticket - ${selectedOrder?.orderCode}</title>
          <style>
            body { font-family: monospace; margin: 0; padding: 0; }
            @media print { body { width: 80mm; } }
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

  const getTimeSince = (date: string | Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    return `${hours}j ${minutes % 60}m`;
  };

  const getTimeColor = (date: string | Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes > 15) return 'text-red-400 bg-red-500/20';
    if (minutes > 10) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-slate-400 bg-slate-600/50';
  };

  const outlet = outletsArray.find((o: IOutlet) => o._id === selectedOutletId);
  // Helper to get table - first check enriched data from API, fallback to separate tables query
  const getTable = (order: any) => {
    if (order.table) return order.table;
    if (order.tableId) return tablesArray.find((t: any) => t._id === order.tableId);
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Kitchen Ticket Modal */}
      {showTicketModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md mx-4 overflow-hidden border border-slate-700">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Kitchen Ticket
              </h3>
              <button 
                onClick={() => setShowTicketModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-auto bg-white">
              <div ref={ticketRef}>
                <KitchenTicket 
                  order={selectedOrder} 
                  outlet={outlet}
                  table={getTable(selectedOrder)}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 space-y-2">
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={printTicket}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Ticket
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowTicketModal(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-full mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Kitchen Display System
              </h1>
              <p className="text-sm text-slate-400">Monitor & update pesanan dapur</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              isConnected 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs font-medium">Offline</span>
                </>
              )}
            </div>

            {/* Sound Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`bg-slate-800 border-slate-700 hover:bg-slate-700 ${
                soundEnabled ? 'text-green-400' : 'text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-3">
              <div className={`px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all ${
                newOrderAlert ? 'ring-2 ring-blue-400 animate-pulse' : ''
              }`}>
                <span className="text-blue-400 text-sm">Menunggu</span>
                <p className="text-xl font-bold text-white">{getOrdersByStatus([OrderStatus.NEW, OrderStatus.ACCEPTED]).length}</p>
              </div>
              <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <span className="text-orange-400 text-sm">Diproses</span>
                <p className="text-xl font-bold text-white">{getOrdersByStatus([OrderStatus.IN_PROGRESS]).length}</p>
              </div>
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <span className="text-green-400 text-sm">Siap</span>
                <p className="text-xl font-bold text-white">{getOrdersByStatus([OrderStatus.READY]).length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
              <Store className="h-4 w-4 text-slate-400" />
              <select
                className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
              >
                {outletsArray.map((outlet: IOutlet) => (
                  <option key={outlet._id} value={outlet._id} className="bg-slate-800">
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Last Update & New Order Alert */}
        <div className="flex items-center justify-between mt-2 px-4">
          <span className="text-xs text-slate-500">
            Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}
          </span>
          {newOrderAlert && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full animate-bounce">
              <Bell className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-blue-400 font-semibold">Pesanan Baru!</span>
            </div>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="p-4">
        {isLoading ? (
          <LoadingCard />
        ) : ordersArray.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-slate-500">
            <UtensilsCrossed className="h-24 w-24 mb-4 opacity-20" />
            <h2 className="text-2xl font-semibold mb-2">Tidak Ada Pesanan</h2>
            <p className="text-slate-600">Pesanan yang sudah dibayar akan muncul di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
            {columns.map((column) => {
              const Icon = column.icon;
              const columnOrders = getOrdersByStatus(column.statuses);
              
              return (
                <div key={column.title} className="flex flex-col">
                  {/* Column Header */}
                  <div className={`p-4 rounded-t-2xl ${column.headerBg} shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-white" />
                        <div>
                          <h2 className="font-bold text-white text-lg">{column.title}</h2>
                          <p className="text-white/70 text-xs">{column.subtitle}</p>
                        </div>
                      </div>
                      <span className="bg-white/20 text-white text-lg font-bold px-3 py-1 rounded-full min-w-[40px] text-center">
                        {columnOrders.length}
                      </span>
                    </div>
                  </div>
                  
                  {/* Column Content */}
                  <div className={`flex-1 overflow-y-auto ${column.bgColor} rounded-b-2xl p-3 space-y-3 border-x border-b ${column.color}`}>
                    {columnOrders.map((order: any) => {
                      const orderTable = getTable(order);
                      
                      return (
                        <Card key={order._id} className="bg-slate-800/90 border-slate-600 hover:border-slate-500 transition-all shadow-lg">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-xl text-white font-bold">
                                  #{order.orderCode}
                                </CardTitle>
                                {orderTable && (
                                  <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-semibold">
                                    🪑 Meja {orderTable.name}
                                  </span>
                                )}
                              </div>
                              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getTimeColor(order.createdAt!)}`}>
                                <Clock className="h-3 w-3" />
                                {getTimeSince(order.createdAt!)}
                              </div>
                            </div>
                            {order.customer?.name && (
                              <p className="text-slate-400 text-sm mt-1">👤 {order.customer.name}</p>
                            )}
                          </CardHeader>
                          
                          <CardContent className="p-4 pt-2">
                            {/* Items */}
                            <div className="space-y-2 mb-4">
                              {order.items?.map((item: any, index: number) => (
                                <div key={index} className="flex items-start gap-2 py-2 border-b border-slate-700/50 last:border-0">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg font-bold text-sm flex-shrink-0">
                                    {item.qty}x
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-white font-medium">{item.nameSnapshot}</p>
                                    {item.variantSnapshot && (
                                      <p className="text-slate-400 text-xs">↳ {item.variantSnapshot.name}</p>
                                    )}
                                    {item.addonsSnapshot?.length > 0 && (
                                      <p className="text-slate-400 text-xs">+ {item.addonsSnapshot.map((a: any) => a.name).join(', ')}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Notes */}
                            {order.items?.some((item: any) => item.note) && (
                              <div className="text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                                <p className="font-semibold text-amber-400 mb-1">📝 Catatan:</p>
                                {order.items?.filter((item: any) => item.note).map((item: any, i: number) => (
                                  <p key={i} className="text-amber-300">
                                    • <span className="font-medium">{item.nameSnapshot}:</span> {item.note}
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                                onClick={() => handlePrintTicket(order)}
                              >
                                <Printer className="h-4 w-4 mr-1" />
                                Print
                              </Button>

                              {(order.status === OrderStatus.NEW || order.status === OrderStatus.ACCEPTED) && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                                  onClick={() => handleUpdateStatus(order._id, OrderStatus.IN_PROGRESS)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Mulai Masak
                                </Button>
                              )}

                              {order.status === OrderStatus.IN_PROGRESS && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                                  onClick={() => handleUpdateStatus(order._id, OrderStatus.READY)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Selesai
                                </Button>
                              )}

                              {order.status === OrderStatus.READY && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                  onClick={() => handleUpdateStatus(order._id, OrderStatus.SERVED)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Sudah Diantar
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {columnOrders.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Tidak ada pesanan</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
