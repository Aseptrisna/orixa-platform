import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/spinner';
import { Clock, Check, ChefHat, Utensils, XCircle, CreditCard, Banknote, QrCode, Copy } from 'lucide-react';
import { OrderStatus, PaymentStatus, PaymentMethod, IOrder, IPayment } from '@orixa/shared';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const socket = useSocket();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: () => publicApi.getOrder(orderId!),
    enabled: !!orderId,
    refetchInterval: 30000,
  });

  const order: IOrder | undefined = data?.data?.order;
  const outlet = data?.data?.outlet;
  const payment: IPayment | undefined = data?.data?.payment;
  const paymentInstructions = data?.data?.paymentInstructions;

  useEffect(() => {
    if (socket && orderId) {
      socket.emit('join:customer', { orderId });
      socket.on('order.status.updated', (updatedData: any) => {
        if (updatedData.orderId === orderId || updatedData._id === orderId) refetch();
      });
      socket.on('payment.updated', (updatedData: any) => {
        if (updatedData.orderId === orderId) refetch();
      });
      return () => {
        socket.off('order.status.updated');
        socket.off('payment.updated');
      };
    }
  }, [socket, orderId, refetch]);

  if (isLoading) return <LoadingPage />;

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Order tidak ditemukan</p>
            <Link to="/"><Button className="mt-4">Kembali</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusStep = (status: OrderStatus) => {
    const steps = [OrderStatus.NEW, OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS, OrderStatus.READY, OrderStatus.SERVED];
    return steps.indexOf(status);
  };

  const statusIcons: Record<string, any> = {
    [OrderStatus.NEW]: Clock,
    [OrderStatus.ACCEPTED]: Check,
    [OrderStatus.IN_PROGRESS]: ChefHat,
    [OrderStatus.READY]: Utensils,
    [OrderStatus.SERVED]: Check,
    [OrderStatus.CANCELLED]: XCircle,
  };

  const statusLabels: Record<string, string> = {
    [OrderStatus.NEW]: 'Pesanan Diterima',
    [OrderStatus.ACCEPTED]: 'Dikonfirmasi',
    [OrderStatus.IN_PROGRESS]: 'Sedang Diproses',
    [OrderStatus.READY]: 'Siap Diambil',
    [OrderStatus.SERVED]: 'Selesai',
    [OrderStatus.CANCELLED]: 'Dibatalkan',
  };

  const currentStep = getStatusStep(order.status);
  const steps = [
    { status: OrderStatus.NEW, label: 'Diterima' },
    { status: OrderStatus.ACCEPTED, label: 'Dikonfirmasi' },
    { status: OrderStatus.IN_PROGRESS, label: 'Diproses' },
    { status: OrderStatus.READY, label: 'Siap' },
    { status: OrderStatus.SERVED, label: 'Selesai' },
  ];

  const copyOrderCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    toast.success('Kode order disalin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white p-4">
        <div className="text-center">
          <p className="text-sm text-blue-100">Nomor Pesanan</p>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-bold">#{order.orderCode}</h1>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={copyOrderCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-blue-100 mt-1">{outlet?.name}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            {order.status === OrderStatus.CANCELLED ? (
              <div className="text-center py-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-semibold">Pesanan Dibatalkan</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  {steps.map((step, index) => {
                    const isCompleted = currentStep >= index;
                    const isCurrent = currentStep === index;
                    const Icon = statusIcons[step.status];
                    return (
                      <div key={step.status} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'} ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-xs text-center ${isCompleted ? 'text-primary font-medium' : 'text-gray-400'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Status Saat Ini</p>
                  <p className="text-xl font-bold text-primary">{statusLabels[order.status]}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Status Pembayaran</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {payment?.method === PaymentMethod.CASH && <Banknote className="h-5 w-5" />}
                {payment?.method === PaymentMethod.TRANSFER && <CreditCard className="h-5 w-5" />}
                {payment?.method === PaymentMethod.QR && <QrCode className="h-5 w-5" />}
                {!payment && <CreditCard className="h-5 w-5" />}
                <span className="font-medium">
                  {payment?.method === PaymentMethod.CASH && 'Cash'}
                  {payment?.method === PaymentMethod.TRANSFER && 'Transfer'}
                  {payment?.method === PaymentMethod.QR && 'QRIS'}
                  {!payment && 'Belum dipilih'}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.paymentStatus === PaymentStatus.PAID ? 'bg-green-100 text-green-700' : order.paymentStatus === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {order.paymentStatus === PaymentStatus.PAID && 'Lunas'}
                {order.paymentStatus === PaymentStatus.PENDING && 'Menunggu Pembayaran'}
                {order.paymentStatus === PaymentStatus.UNPAID && 'Belum Bayar'}
              </span>
            </div>

            {order.paymentStatus !== PaymentStatus.PAID && paymentInstructions && payment && (
              <div className="bg-gray-50 rounded-lg p-4">
                {payment.method === PaymentMethod.TRANSFER && paymentInstructions.transfer && (
                  <div className="space-y-2">
                    <p className="font-medium">Transfer ke:</p>
                    <p className="text-lg font-bold">{paymentInstructions.transfer.bankName}</p>
                    <p className="text-xl font-mono font-bold">{paymentInstructions.transfer.accountNumberOrVA}</p>
                    <p className="text-gray-600">a.n. {paymentInstructions.transfer.accountName}</p>
                  </div>
                )}
                {payment.method === PaymentMethod.QR && paymentInstructions.qr && (
                  <div className="text-center">
                    <p className="font-medium mb-3">Scan QR untuk bayar:</p>
                    {paymentInstructions.qr.qrImageUrl ? (
                      <img src={paymentInstructions.qr.qrImageUrl} alt="QR Payment" className="max-w-[200px] mx-auto" />
                    ) : (
                      <p className="text-gray-500">QR tidak tersedia</p>
                    )}
                  </div>
                )}
                {payment.method === PaymentMethod.CASH && (
                  <p className="text-center text-gray-600">Silakan bayar di kasir saat mengambil pesanan</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Detail Pesanan</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.qty}x</span> <span>{item.nameSnapshot}</span>
                    {item.note && <p className="text-xs text-gray-500">📝 {item.note}</p>}
                  </div>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.tax > 0 && <div className="flex justify-between text-gray-600"><span>Pajak</span><span>{formatCurrency(order.tax)}</span></div>}
              {order.service > 0 && <div className="flex justify-between text-gray-600"><span>Service</span><span>{formatCurrency(order.service)}</span></div>}
              <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-sm text-gray-600">
            <div className="flex justify-between"><span>Waktu Order</span><span>{formatDate(order.createdAt!, 'full')}</span></div>
            {order.customer?.name && <div className="flex justify-between mt-1"><span>Nama</span><span>{order.customer.name}</span></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
