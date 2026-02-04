import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { toast } from 'sonner';
import { IOrder } from '@orixa/shared';

interface UseOrderNotificationsOptions {
  outletId?: string;
  onNewOrder?: (order: IOrder) => void;
  onOrderStatusUpdated?: (order: IOrder) => void;
  onPaymentUpdated?: (payment: any) => void;
  enableSound?: boolean;
  enableBrowserNotification?: boolean;
}

// Notification sound (base64 encoded short beep)
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18' +
  'AAACAAABgAACAYGBgAABgYGBgAAAAAAAAAACAgIAAAAAAAACAgICAgAAAgICAgICAgIAAAAgICAgICAgICACAgIAACAgICAg' +
  'ICAgICACAgIAACAgICAICAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

export function useOrderNotifications({
  outletId,
  onNewOrder,
  onOrderStatusUpdated,
  onPaymentUpdated,
  enableSound = true,
  enableBrowserNotification = true,
}: UseOrderNotificationsOptions) {
  const socket = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(NOTIFICATION_SOUND);
      audioRef.current.volume = 0.5;
    }
    return () => {
      audioRef.current = null;
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if (enableBrowserNotification && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [enableBrowserNotification]);

  const playSound = useCallback(() => {
    if (enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked, ignore error
      });
    }
  }, [enableSound]);

  const showBrowserNotification = useCallback((title: string, body: string) => {
    if (enableBrowserNotification && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  }, [enableBrowserNotification]);

  useEffect(() => {
    if (!socket) return;

    // New order event
    const handleNewOrder = (order: IOrder) => {
      // Only show notification if order is for this outlet or no outlet filter
      if (outletId && order.outletId !== outletId) return;

      playSound();
      
      const customerName = order.customer?.name || 'Pelanggan';
      const itemCount = order.items?.length || 0;
      
      toast.success(`🛒 Pesanan Baru!`, {
        description: `${customerName} - ${itemCount} item`,
        duration: 5000,
      });

      showBrowserNotification(
        '🛒 Pesanan Baru Masuk!',
        `${customerName} memesan ${itemCount} item`
      );

      onNewOrder?.(order);
    };

    // Order status updated
    const handleOrderStatusUpdated = (order: IOrder) => {
      if (outletId && order.outletId !== outletId) return;

      const statusLabels: Record<string, string> = {
        ACCEPTED: '✅ Diterima',
        IN_PROGRESS: '🍳 Diproses',
        READY: '🔔 Siap Diambil',
        SERVED: '✨ Telah Disajikan',
        CANCELLED: '❌ Dibatalkan',
      };

      if (order.status && statusLabels[order.status]) {
        toast.info(`Status Pesanan: ${statusLabels[order.status]}`, {
          description: `Order #${order.orderCode}`,
          duration: 3000,
        });
      }

      onOrderStatusUpdated?.(order);
    };

    // Payment updated
    const handlePaymentUpdated = (payment: any) => {
      const statusLabels: Record<string, string> = {
        PAID: '💰 Pembayaran Diterima',
        REJECTED: '❌ Pembayaran Ditolak',
      };

      if (payment.status && statusLabels[payment.status]) {
        playSound();
        toast.success(statusLabels[payment.status], {
          duration: 3000,
        });
      }

      onPaymentUpdated?.(payment);
    };

    socket.on('order.created', handleNewOrder);
    socket.on('order.status.updated', handleOrderStatusUpdated);
    socket.on('payment.updated', handlePaymentUpdated);

    return () => {
      socket.off('order.created', handleNewOrder);
      socket.off('order.status.updated', handleOrderStatusUpdated);
      socket.off('payment.updated', handlePaymentUpdated);
    };
  }, [socket, outletId, onNewOrder, onOrderStatusUpdated, onPaymentUpdated, playSound, showBrowserNotification]);

  return socket;
}
