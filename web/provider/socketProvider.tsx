'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

type SocketCtx = { socket: Socket | null; isConnected: boolean };

const SocketContext = createContext<SocketCtx>({ socket: null, isConnected: false });
export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!url) return;

    const s = io(url, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true, // ✅ Gửi cookie (accessToken phải là httpOnly cookie)
      autoConnect: true,
    });

    console.log('[SocketProvider] 🔌 Connecting to', url);
    
    let isMounted = true;
    let connectTimer: ReturnType<typeof setTimeout> | null = null;
    connectTimer = setTimeout(() => {
      if (isMounted) setSocket(s);
    }, 0);

    s.on('connect', () => {
      console.log('[SocketProvider] ✅ Connected:', s.id);
      setIsConnected(true);
    });
    
    s.on('disconnect', (reason) => {
      console.log('[SocketProvider] ❌ Disconnected:', reason);
      setIsConnected(false);
    });
    
    s.on('connect_error', (err) => {
      console.error('[SocketProvider] 🚨 Connection error:', err.message);
    });

    // ✅ Debug: Listen all events
    s.onAny((eventName, ...args) => {
      console.log('[SocketProvider] 📨 Event received:', eventName, args);
    });

    return () => {
      if (connectTimer) clearTimeout(connectTimer);
      isMounted = false;
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setIsConnected(false);
      console.log('[SocketProvider] 🔌 Cleanup socket');
    };
  }, []);

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>;
}