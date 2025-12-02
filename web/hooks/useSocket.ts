/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// ...existing code...
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/provider/socketProvider';
import { useQueryClient } from '@tanstack/react-query';

export type Message = any;

export default function useSupportChat() {
  const { socket } = useSocket();
  const qc = useQueryClient();
  const [conversation, setConversation] = useState<{ conversationId: string; adminId: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  // start or get conversation from server
  const startConversation = useCallback(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/start`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (res.ok && data.data) {
      setConversation(data.data);
      // join socket room
      socket?.emit('join_support_room', data.data.conversationId);
      return data.data;
    }
    throw new Error(data?.message || 'Start conversation failed');
  }, [socket]);

  // load history
  const loadMessages = useCallback(async (convId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/${convId}/messages?page=1&limit=100`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok) {
      setMessages(data.data || []);
    }
    return data;
  }, []);

  // send message via REST (server will save + emit)
  const sendMessage = useCallback(async (convId: string, text: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/${convId}/message`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, messageType: 'text' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Send failed');
    // saved message returned; local update not necessary because socket will emit the saved message.
    return data.data;
  }, []);

  // socket listener
  useEffect(() => {
    if (!socket) return;
    const handler = (msg: Message) => {
      // append if conversation matches
      const convId = (msg.conversationId) || (conversation?.conversationId);
      if (!convId) return;
      setMessages(prev => {
        // prevent duplicates by _id if present
        if (msg._id && prev.some(m => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    };
    socket.on('support_new_message', handler);
    return () => {
      socket.off('support_new_message', handler);
    };
  }, [socket, conversation?.conversationId]);

  // leave room helper
  const leaveConversation = useCallback(() => {
    if (!socket || !conversation) return;
    socket.emit('leave_support_room', conversation.conversationId);
    setConversation(null);
    setMessages([]);
  }, [socket, conversation]);

  return {
    conversation,
    setConversation,
    messages,
    startConversation,
    loadMessages,
    sendMessage,
    leaveConversation,
    setMessages,
  };
}
// ...existing code...