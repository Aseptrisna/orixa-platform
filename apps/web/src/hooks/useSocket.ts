import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useSocket(): Socket | null {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: false,
      });
    }

    const socket = socketRef.current;

    if (isAuthenticated && user) {
      socket.connect();
      
      // Join staff room if user has company/outlet
      if (user.companyId && user.outletIds?.[0]) {
        socket.emit('join:staff', {
          companyId: user.companyId,
          outletId: user.outletIds[0],
        });
      }
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return socketRef.current;
}
