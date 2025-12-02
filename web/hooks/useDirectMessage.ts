/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendMessageUser } from "@/lib/client-actions";
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

type DirectMessage = any;
type Conversation = { _id?: string; conversationId?: string } | null;

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API;

function decodeUserIdFromToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const t = localStorage.getItem("accessToken");
    if (!t) return null;
    const payload = JSON.parse(atob(t.split(".")[1]));
    return payload?.userId || payload?.user?._id || payload?.sub || null;
  } catch {
    return null;
  }
}

export function useDirectMessage() {
  const [conversation, setConversation] = useState<Conversation>(null);
  const conversationRef = useRef<Conversation>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const socketRef = useRef<any>(null);
  const joinedRoomRef = useRef<string | null>(null);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    if (socketRef.current) return;
    
    const token = (typeof window !== "undefined" && localStorage.getItem("accessToken")) || undefined;
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current.on("connect", () => {
      console.log("[DirectMessage] socket connected", socketRef.current.id);
      
      const myId = decodeUserIdFromToken();
      if (myId) {
        try {
          socketRef.current.emit("join_user_room", String(myId), (ack: any) => {
            console.log("[DirectMessage] join_user_room ack", ack);
          });
        } catch {
          socketRef.current.emit("join_user_room", String(myId));
        }
      }
    });

    socketRef.current.on("disconnect", (reason: any) => {
      console.log("[DirectMessage] disconnected", reason);
    });

    socketRef.current.on("connect_error", (err: any) => {
      console.error("[DirectMessage] connect_error", err);
    });

    socketRef.current.on("new_message", (msg: DirectMessage) => {
      console.log("[DirectMessage] new_message:", msg);
      if (!msg) return;

      const msgConvId = String(msg.conversationId ?? msg.conversation?._id ?? "");
      const curConvId = String(conversationRef.current?._id ?? conversationRef.current?.conversationId ?? "");
      
      if (!curConvId || msgConvId !== curConvId) {
        return;
      }

      setMessages((prev) => {
        const optIdx = prev.findIndex((m) => m.__optimistic && m.message === msg.message);
        if (optIdx !== -1) {
          const copy = [...prev];
          copy.splice(optIdx, 1);
          if (!copy.some((x) => String(x._id) === String(msg._id))) {
            copy.push(msg);
          }
          return copy;
        }
        
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    });

    socketRef.current.on("conversation_updated", (data: any) => {
      console.log("[DirectMessage] conversation_updated:", data);
      if (data.conversationId === conversationRef.current?._id) {
        setConversation((prev) => prev ? { ...prev, lastMessage: data.lastMessage } : prev);
      }
    });

    socketRef.current.on("messages_read", (data: any) => {
      console.log("[DirectMessage] messages_read:", data);
      if (data.conversationId === conversationRef.current?._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === decodeUserIdFromToken() ? { ...m, isRead: true, readAt: data.readAt } : m
          )
        );
      }
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinRoom = useCallback((convId: string) => {
    return new Promise<void>((resolve) => {
      if (!socketRef.current) return resolve();
      if (joinedRoomRef.current === convId) return resolve();
      
      if (joinedRoomRef.current) {
        socketRef.current.emit("leave_conversation", joinedRoomRef.current);
      }

      let resolved = false;
      try {
        socketRef.current.emit("join_conversation", convId, (ack: any) => {
          joinedRoomRef.current = convId;
          resolved = true;
          console.log("[DirectMessage] join_conversation ack", ack);
          resolve();
        });
      } catch {
        socketRef.current.emit("join_conversation", convId);
      }

      setTimeout(() => {
        if (!resolved) {
          joinedRoomRef.current = convId;
          console.log("[DirectMessage] join_conversation (fallback)", convId);
          resolve();
        }
      }, 250);
    });
  }, []);

  const getOrCreateConversation = useCallback(
    async (
      otherUserId: string,
      context?: { campsiteId?: string; bookingId?: string }
    ) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        
        const res = await fetch(`${API}/messages/conversations`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            otherUserId,
            campsiteId: context?.campsiteId,
            bookingId: context?.bookingId,
          }),
        });

        if (!res.ok) throw new Error("Get conversation failed");
        
        const body = await res.json();
        const conv = body?.data ?? body;
        
        setConversation(conv);
        
        if (conv?._id) {
          await joinRoom(conv._id);
        }
        
        return conv;
      } catch (err) {
        console.error("[DirectMessage] getOrCreateConversation error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [joinRoom]
  );

  const loadMessages = useCallback(
    async (conversationId: string, page = 1, limit = 50) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        
        const res = await fetch(
          `${API}/messages/${conversationId}?page=${page}&limit=${limit}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Load messages failed");
        
        const body = await res.json();
        const msgs = body?.data ?? [];
        
        setMessages(msgs);
        
        await joinRoom(conversationId);
        
        return msgs;
      } catch (err) {
        console.error("[DirectMessage] loadMessages error:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [joinRoom]
  );

  const sendMessage = useCallback(
    async (
      conversationId: string,
      payload: {
        message: string;
        messageType?: string;
        attachments?: any[];
        bookingRef?: string;
        campsiteRef?: string;
      }
    ) => {
      try {
        await joinRoom(conversationId);
        await new Promise((r) => setTimeout(r, 20));

        const resolvedSenderId = decodeUserIdFromToken();
        
        // ✅ Tạo optimistic message với senderId là object có _id
        const tempId = `tmp-${Date.now()}`;
        const optimistic: DirectMessage = {
          _id: tempId,
          conversationId,
          message: payload.message,
          senderId: {
            _id: resolvedSenderId, // ✅ Object với _id thay vì string
          },
          messageType: payload.messageType || "text",
          createdAt: new Date().toISOString(),
          __optimistic: true,
        };
        
        setMessages((p) => [...p, optimistic]);
        setSending(true);
       
        const res = await sendMessageUser(conversationId, payload);
        
  
        if (!res.success) {
          setMessages((p) => p.filter((m) => m._id !== tempId));
          throw new Error(res.message || "Send failed");
        }

        return res.data;
      } catch (err) {
        console.error("[DirectMessage] sendMessage error:", err);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [joinRoom]
  );

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      await fetch(`${API}/messages/${conversationId}/read`, {
        method: "PUT",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("[DirectMessage] markAsRead error:", err);
    }
  }, []);

  const leaveConversation = useCallback(() => {
    if (!socketRef.current) return;
    
    if (joinedRoomRef.current) {
      socketRef.current.emit("leave_conversation", joinedRoomRef.current);
      joinedRoomRef.current = null;
    }
    
    setConversation(null);
    setMessages([]);
  }, []);

  return {
    conversation,
    messages,
    loading,
    sending,
    getOrCreateConversation,
    loadMessages,
    sendMessage,
    markAsRead,
    leaveConversation,
  };
}