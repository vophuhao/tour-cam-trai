'use client';

// ...existing code...
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
      withCredentials: true, // gửi cookie httpOnly
      autoConnect: true,
    });

    console.log('[socket] connecting to', url);
    // schedule the initial state update asynchronously to avoid synchronous setState inside the effect
    let isMounted = true;
    let connectTimer: ReturnType<typeof setTimeout> | null = null;
    connectTimer = setTimeout(() => {
      if (isMounted) setSocket(s);
    }, 0);

    s.on('connect', () => {
      console.log('[socket] connected', s.id);
      setIsConnected(true);
    });
    s.on('disconnect', (reason) => {
      console.log('[socket] disconnected', reason);
      setIsConnected(false);
    });
    s.on('connect_error', (err) => console.warn('[socket] connect_error', err));

    return () => {
      if (connectTimer) clearTimeout(connectTimer);
      isMounted = false;
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>;
}
// ...existing code...