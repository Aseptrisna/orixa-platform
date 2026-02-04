import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posApi, outletsApi, paymentsApi } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { OrderStatus, PaymentStatus } from '@orixa/shared';
import {
  Receipt,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Printer,
  CheckCircle,
  Clock,
  CreditCard,
  Banknote,
  QrCode,
  Store,
  User,
  Hash,
  MapPin,
  ShoppingBag,
  RefreshCw,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [selectedOutlet, setSelectedOutlet] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: outletsData, isLoading: loadingOutlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const outlets = outletsData?.data?.data || outletsData?.data || [];

  const { data: ordersData, isLoading: loadingOrders, refetch } = useQuery({
    queryKey: ['transactions', selectedOutlet],
    queryFn: () => posApi.getOrders({ 
      outletId: selectedOutlet || undefined,
      limit: 500, // Get more data for client-side filtering
    }),
    enabled: true,
  });

  // Handle different response formats
  const rawOrders = ordersData?.data?.data || ordersData?.data || [];
  const orders = Array.isArray(rawOrders) ? rawOrders : [];

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchCode = order.orderCode?.toLowerCase().includes(search);
        const matchName = order.customer?.name?.toLowerCase().includes(search);
        const matchPhone = order.customer?.phone?.includes(search);
        if (!matchCode && !matchName && !matchPhone) return false;
      }

      // Date filter
      if (dateFrom) {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (orderDate < dateFrom) return false;
      }
      if (dateTo) {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (orderDate > dateTo) return false;
      }

      // Payment status filter
      if (paymentStatusFilter && order.paymentStatus !== paymentStatusFilter) return false;

      return true;
    });
  }, [orders, searchTerm, dateFrom, dateTo, paymentStatusFilter]);

  // Pagination calculations
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, paymentStatusFilter, selectedOutlet]);

  // Calculate totals
  const totalRevenue = filteredOrders
    .filter((o: any) => o.paymentStatus === PaymentStatus.PAID)
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  const totalOrders = filteredOrders.length;
  const paidOrders = filteredOrders.filter((o: any) => o.paymentStatus === PaymentStatus.PAID).length;
  const pendingOrders = filteredOrders.filter((o: any) => o.paymentStatus === PaymentStatus.PENDING).length;

  const confirmPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => paymentsApi.confirm(paymentId),
    onSuccess: () => {
      toast.success('Pembayaran berhasil dikonfirmasi');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => {
      toast.error('Gagal mengkonfirmasi pembayaran');
    },
  });

  // Export to Excel function
  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      toast.error('Tidak ada data untuk di-export');
      return;
    }

    // Prepare data for Excel
    const excelData = filteredOrders.map((order: any, index: number) => {
      const outlet = outlets.find((o: any) => o._id === order.outletId);
      return {
        'No': index + 1,
        'Kode Order': order.orderCode || '-',
        'Tanggal': new Date(order.createdAt).toLocaleDateString('id-ID'),
        'Waktu': new Date(order.createdAt).toLocaleTimeString('id-ID'),
        'Outlet': outlet?.name || '-',
        'Pelanggan': order.customer?.name || 'Guest',
        'Telepon': order.customer?.phone || '-',
        'Channel': order.channel || '-',
        'Meja': typeof order.tableId === 'object' ? order.tableId?.name : (order.tableId || '-'),
        'Items': order.items?.map((i: any) => `${i.nameSnapshot} x${i.qty}`).join(', ') || '-',
        'Subtotal': order.subtotal || 0,
        'Diskon': order.discount || 0,
        'Pajak': order.tax || 0,
        'Service': order.service || 0,
        'Total': order.total || 0,
        'Metode Bayar': order.paymentMethod || '-',
        'Status Order': order.status || '-',
        'Status Bayar': order.paymentStatus || '-',
      };
    });

    // Create CSV content
    const headers = Object.keys(excelData[0]);
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => 
        headers.map(header => {
          let value = (row as any)[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `transaksi_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Berhasil export ${filteredOrders.length} transaksi`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.NEW: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case OrderStatus.ACCEPTED: return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300';
      case OrderStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case OrderStatus.READY: return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case OrderStatus.SERVED: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
      case OrderStatus.CLOSED: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case PaymentStatus.PENDING: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case PaymentStatus.UNPAID: return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      case PaymentStatus.REFUNDED: return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'CASH': return <Banknote className="h-4 w-4 text-green-600" />;
      case 'TRANSFER': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'QR': return <QrCode className="h-4 w-4 text-purple-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleViewReceipt = (order: any) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && selectedOrder) {
      printWindow.document.write(generateReceiptHTML(selectedOrder));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateReceiptHTML = (order: any) => {
    const outlet = outlets.find((o: any) => o._id === order.outletId);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk #${order.orderCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', monospace; 
            width: 80mm; 
            padding: 10px;
            font-size: 12px;
          }
          .header { text-align: center; margin-bottom: 15px; }
          .header h1 { font-size: 18px; font-weight: bold; }
          .header p { font-size: 11px; color: #666; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 3px 0; }
          .item { margin: 5px 0; }
          .item-name { font-weight: bold; }
          .item-details { padding-left: 10px; color: #666; }
          .total-section { margin-top: 10px; }
          .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
          .grand-total { font-size: 16px; font-weight: bold; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${outlet?.name || 'ORIXA POS'}</h1>
          <p>${outlet?.address || ''}</p>
          <p>${outlet?.phone || ''}</p>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-row">
          <span>No. Order:</span>
          <span>${order.orderCode}</span>
        </div>
        <div class="info-row">
          <span>Tanggal:</span>
          <span>${new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
        </div>
        <div class="info-row">
          <span>Waktu:</span>
          <span>${new Date(order.createdAt).toLocaleTimeString('id-ID')}</span>
        </div>
        ${order.tableId ? `<div class="info-row"><span>Meja:</span><span>${typeof order.tableId === 'object' ? order.tableId.name : order.tableId}</span></div>` : ''}
        ${order.customer?.name ? `<div class="info-row"><span>Pelanggan:</span><span>${order.customer.name}</span></div>` : ''}
        
        <div class="divider"></div>
        
        ${order.items?.map((item: any) => `
          <div class="item">
            <div class="item-name">${item.nameSnapshot || item.menuItemId?.name}</div>
            <div class="item-details">
              ${item.qty} x ${formatCurrency(item.basePriceSnapshot || 0)} = ${formatCurrency(item.lineTotal || 0)}
            </div>
            ${item.variantSnapshot ? `<div class="item-details">Varian: ${item.variantSnapshot.name}</div>` : ''}
            ${item.note ? `<div class="item-details">Catatan: ${item.note}</div>` : ''}
          </div>
        `).join('')}
        
        <div class="divider"></div>
        
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(order.subtotal || 0)}</span>
          </div>
          ${order.discount ? `<div class="total-row"><span>Diskon</span><span>-${formatCurrency(order.discount)}</span></div>` : ''}
          ${order.tax ? `<div class="total-row"><span>Pajak</span><span>${formatCurrency(order.tax)}</span></div>` : ''}
          ${order.service ? `<div class="total-row"><span>Service</span><span>${formatCurrency(order.service)}</span></div>` : ''}
        </div>
        
        <div class="divider"></div>
        
        <div class="grand-total">
          <div class="total-row">
            <span>TOTAL</span>
            <span>${formatCurrency(order.total || 0)}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Powered by ORIXA POS</p>
        </div>
      </body>
      </html>
    `;
  };

  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loadingOutlets) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Daftar Transaksi"
        description="Kelola semua transaksi dan pembayaran"
        icon={Receipt}
        iconColor="from-emerald-500 to-teal-600"
      >
        <div className="flex gap-2">
          <Button 
            onClick={exportToExcel} 
            variant="outline" 
            className="gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Order</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Terbayar</p>
                <p className="text-2xl font-bold">{paidOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <Banknote className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg dark:bg-slate-800">
        <CardHeader className="border-b bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
          <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
            <Filter className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Cari Order</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Kode order, nama, telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Outlet */}
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Outlet</Label>
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
              >
                <option value="">Semua Outlet</option>
                {outlets.map((outlet: any) => (
                  <option key={outlet._id} value={outlet._id}>{outlet.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Dari Tanggal</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Sampai Tanggal</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Payment Status */}
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Status Bayar</Label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
              >
                <option value="">Semua Status</option>
                <option value="PAID">Lunas</option>
                <option value="PENDING">Pending</option>
                <option value="UNPAID">Belum Bayar</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="border-0 shadow-lg dark:bg-slate-800">
        <CardHeader className="border-b bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg dark:text-white">
              Daftar Order ({filteredOrders.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-500 dark:text-slate-400">Per halaman:</Label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2 rounded-md border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingOrders ? (
            <div className="flex items-center justify-center h-32">
              <Spinner />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p>Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
            <>
              <div className="divide-y dark:divide-slate-700">
                {paginatedOrders.map((order: any) => (
                  <div key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    {/* Order Summary Row */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-wrap">
                          {/* Order Code */}
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                              <Hash className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{order.orderCode}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(order.createdAt).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>

                          {/* Table */}
                          {order.tableId && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-400 text-sm">
                              <MapPin className="h-3 w-3" />
                              <span>Meja {typeof order.tableId === 'object' ? order.tableId.name : order.tableId}</span>
                            </div>
                          )}

                          {/* Customer */}
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm">
                            <User className="h-4 w-4" />
                            <span>{order.customer?.name || 'Guest'}</span>
                          </div>

                          {/* Channel */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.channel === 'POS' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                              : 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
                          }`}>
                            {order.channel}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Status Badges */}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>

                          {/* Total */}
                          <span className="font-bold text-lg text-slate-800 dark:text-white min-w-[120px] text-right">
                            {formatCurrency(order.total || 0)}
                          </span>

                          {/* Expand Icon */}
                          {expandedOrder === order._id ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedOrder === order._id && (
                      <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Items */}
                          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg p-4 border dark:border-slate-700">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Detail Pesanan</h4>
                            <div className="space-y-2">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-start py-2 border-b dark:border-slate-700 last:border-0">
                                  <div>
                                    <p className="font-medium text-slate-800 dark:text-white">
                                      {item.nameSnapshot || 'Item'}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {item.qty} x {formatCurrency(item.basePriceSnapshot || 0)}
                                    </p>
                                    {item.variantSnapshot && (
                                      <p className="text-xs text-slate-400 dark:text-slate-500">Varian: {item.variantSnapshot.name}</p>
                                    )}
                                    {item.note && (
                                      <p className="text-xs text-orange-500">Catatan: {item.note}</p>
                                    )}
                                  </div>
                                  <span className="font-semibold text-slate-800 dark:text-white">
                                    {formatCurrency(item.lineTotal || 0)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t dark:border-slate-700 space-y-1 text-sm">
                              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal || 0)}</span>
                              </div>
                              {order.discount > 0 && (
                                <div className="flex justify-between text-red-500">
                                  <span>Diskon</span>
                                  <span>-{formatCurrency(order.discount)}</span>
                                </div>
                              )}
                              {order.tax > 0 && (
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                  <span>Pajak</span>
                                  <span>{formatCurrency(order.tax)}</span>
                                </div>
                              )}
                              {order.service > 0 && (
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                  <span>Service</span>
                                  <span>{formatCurrency(order.service)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-slate-700 text-slate-800 dark:text-white">
                                <span>Total</span>
                                <span>{formatCurrency(order.total || 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border dark:border-slate-700">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Info Pembayaran</h4>
                            
                            {order.paymentMethod && (
                              <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                {getPaymentIcon(order.paymentMethod)}
                                <span className="text-sm font-medium dark:text-white">{order.paymentMethod}</span>
                              </div>
                            )}

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Status Order</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Status Bayar</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              <Button 
                                onClick={() => handleViewReceipt(order)}
                                className="w-full gap-2"
                                variant="outline"
                              >
                                <Eye className="h-4 w-4" />
                                Lihat Struk
                              </Button>

                              {order.paymentStatus === PaymentStatus.PENDING && (
                                <Button 
                                  onClick={() => {
                                    if (order.paymentId) {
                                      confirmPaymentMutation.mutate(order.paymentId);
                                    }
                                  }}
                                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                                  disabled={confirmPaymentMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Konfirmasi Bayar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} transaksi
                    </p>
                    
                    <div className="flex items-center gap-1">
                      {/* First Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 dark:border-slate-600 dark:text-slate-300"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      
                      {/* Previous Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 dark:border-slate-600 dark:text-slate-300"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`dots-${index}`} className="px-2 text-slate-400">...</span>
                        ) : (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(page as number)}
                            className={`h-8 w-8 p-0 ${
                              currentPage === page 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                : 'dark:border-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      ))}

                      {/* Next Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 dark:border-slate-600 dark:text-slate-300"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Last Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 dark:border-slate-600 dark:text-slate-300"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Receipt Header */}
              <div className="text-center border-b dark:border-slate-700 pb-4 mb-4">
                <Store className="h-12 w-12 mx-auto text-emerald-600 mb-2" />
                <h2 className="text-xl font-bold dark:text-white">
                  {outlets.find((o: any) => o._id === selectedOrder.outletId)?.name || 'ORIXA POS'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {outlets.find((o: any) => o._id === selectedOrder.outletId)?.address}
                </p>
              </div>

              {/* Order Info */}
              <div className="space-y-2 text-sm border-b dark:border-slate-700 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">No. Order</span>
                  <span className="font-mono font-bold dark:text-white">{selectedOrder.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Tanggal</span>
                  <span className="dark:text-white">{new Date(selectedOrder.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Waktu</span>
                  <span className="dark:text-white">{new Date(selectedOrder.createdAt).toLocaleTimeString('id-ID')}</span>
                </div>
                {selectedOrder.tableId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Meja</span>
                    <span className="dark:text-white">{typeof selectedOrder.tableId === 'object' ? selectedOrder.tableId.name : selectedOrder.tableId}</span>
                  </div>
                )}
                {selectedOrder.customer?.name && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Pelanggan</span>
                    <span className="dark:text-white">{selectedOrder.customer.name}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2 text-sm border-b dark:border-slate-700 pb-4 mb-4">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <span className="dark:text-white">{item.nameSnapshot}</span>
                      <span className="text-slate-500 dark:text-slate-400"> x{item.qty}</span>
                    </div>
                    <span className="dark:text-white">{formatCurrency(item.lineTotal || 0)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="dark:text-white">{formatCurrency(selectedOrder.subtotal || 0)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Diskon</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Pajak</span>
                    <span className="dark:text-white">{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                {selectedOrder.service > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Service</span>
                    <span className="dark:text-white">{formatCurrency(selectedOrder.service)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-slate-700">
                  <span className="dark:text-white">TOTAL</span>
                  <span className="dark:text-white">{formatCurrency(selectedOrder.total || 0)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 mb-4">
                <p>Terima kasih atas kunjungan Anda!</p>
                <p>Powered by ORIXA POS</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowReceiptModal(false)}
                  variant="outline"
                  className="flex-1 dark:border-slate-600 dark:text-slate-300"
                >
                  Tutup
                </Button>
                <Button 
                  onClick={handlePrintReceipt}
                  className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Printer className="h-4 w-4" />
                  Cetak
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
