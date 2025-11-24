/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

type SupportMessage = any;
type Conversation = { conversationId?: string; _id?: string } | null;

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

export default function useSupportChat() {
  const [conversation, setConversation] = useState<Conversation>(null);
  const conversationRef = useRef<Conversation>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const socketRef = useRef<any>(null);
  const joinedRoomRef = useRef<string | null>(null);

  // ...existing code...
  // keep ref in sync so handlers see latest conversation
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  // init socket once
  useEffect(() => {
    if (socketRef.current) return;
    const token = (typeof window !== "undefined" && localStorage.getItem("accessToken")) || undefined;
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current.on("connect", () => {
      console.log("[socket] connected", socketRef.current.id);
      // join personal room so server can emit directly to this user
      const myId = decodeUserIdFromToken();
      if (myId) {
        try {
          socketRef.current.emit("join_personal", String(myId), (ack: any) => {
            console.log("[socket] join_personal ack", ack);
          });
        } catch {
          socketRef.current.emit("join_personal", String(myId));
        }
        console.log("[socket] emit join_personal", myId);
      }
    });
    socketRef.current.on("disconnect", (reason: any) => {
      console.log("[socket] disconnected", reason);
    });
    socketRef.current.on("connect_error", (err: any) => {
      console.error("[socket] connect_error", err);
    });

    socketRef.current.on("support_new_message", (msg: SupportMessage) => {
      console.log("[socket] support_new_message raw:", msg, "currentConversation:", conversationRef.current);
      if (!msg) return;

      // normalize conv id
      const msgConv = String(msg.conversationId ?? msg.conversation?._id ?? "");
      const curConv = String(conversationRef.current?.conversationId ?? conversationRef.current?._id ?? "");
      console.log("[socket] conv compare", { msgConv, curConv });

      if (!curConv || msgConv !== curConv) {
        // not for current open conversation -> ignore UI update
        return;
      }

      setMessages((prev) => {
        // replace matching optimistic message if exists
        const optIdx = prev.findIndex((m) => m.__optimistic && m.message === msg.message);
        if (optIdx !== -1) {
          const copy = [...prev];
          copy.splice(optIdx, 1);
          if (!copy.some((x) => String(x._id) === String(msg._id))) copy.push(msg);
          return copy;
        }
        // dedupe by id
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // joinRoom returns Promise and waits for ack or fallback
  const joinRoom = useCallback((convId: string) => {
    return new Promise<void>((resolve) => {
      if (!socketRef.current) return resolve();
      if (joinedRoomRef.current === convId) return resolve();
      if (joinedRoomRef.current) {
        socketRef.current.emit("leave_support_room", joinedRoomRef.current);
      }
      let resolved = false;
      try {
        socketRef.current.emit("join_support_room", convId, (ack: any) => {
          joinedRoomRef.current = convId;
          resolved = true;
          console.log("[socket] join_support_room ack", ack);
          resolve();
        });
      } catch {
        socketRef.current.emit("join_support_room", convId);
      }
      // fallback if no ack from server
      setTimeout(() => {
        if (!resolved) {
          joinedRoomRef.current = convId;
          console.log("[socket] join_support_room (fallback) ->", convId);
          resolve();
        }
      }, 250);
    });
  }, []);

  const leaveConversation = useCallback(() => {
    if (!socketRef.current) return;
    if (joinedRoomRef.current) {
      socketRef.current.emit("leave_support_room", joinedRoomRef.current);
      joinedRoomRef.current = null;
    }
    setConversation(null);
    setMessages([]);
  }, []);

  const startConversation = useCallback(async () => {
    const res = await fetch(`${API}/support/conversation/start`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Start conversation failed");
    const body = await res.json();
    const conv = body?.data ?? body;
    setConversation(conv);
    if (conv?.conversationId) await joinRoom(conv.conversationId);
    return conv;
  }, [joinRoom]);

  const loadMessages = useCallback(
    async (convId: string, page = 1, limit = 200) => {
      const res = await fetch(`${API}/support/conversation/${convId}/messages?page=${page}&limit=${limit}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Load messages failed");
      const body = await res.json();
      const msgs = body?.data?.messages ?? body.messages ?? body?.data ?? [];
      setMessages(msgs);
      // ensure joined (await ack)
      await joinRoom(convId);
      return msgs;
    },
    [joinRoom]
  );

  const sendMessage = useCallback(
    async (convId: string, text: string, senderId?: string) => {
      // ensure joined before sending
      try {
        await joinRoom(convId);
      } catch {}
      // small delay to let server put socket into room (if no ack)
      await new Promise((r) => setTimeout(r, 20));

      const resolvedSenderId = senderId ?? decodeUserIdFromToken() ?? null;

      const tempId = `tmp-${Date.now()}`;
      const optimistic: SupportMessage = {
        _id: tempId,
        conversationId: convId,
        message: text,
        senderModel: "User",
        senderName: "Bạn",
        senderId: resolvedSenderId ?? null,
        createdAt: new Date().toISOString(),
        __optimistic: true,
      };
      setMessages((p) => [...p, optimistic]);

      try {
        const res = await fetch(`${API}/support/conversation/${convId}/message`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, messageType: "text" }),
        });
        const body = await res.json();
        if (!res.ok) {
          setMessages((p) => p.filter((m) => m._id !== tempId));
          throw new Error(body?.message || "Send failed");
        }
        return body?.data ?? body;
      } catch (err) {
        setMessages((p) => p.filter((m) => m._id !== tempId));
        throw err;
      }
    },
    [joinRoom]
  );

  // append local/system message (not persisted)
  const sendLocalSystemMessage = useCallback((convId: string, text: string) => {
    if (!convId) return;
    const sysId = `sys-${Date.now()}`;
    const sysMsg: SupportMessage = {
      _id: sysId,
      conversationId: convId,
      message: text,
      senderModel: "System",
      senderName: "Hỗ trợ",
      senderId: "system",
      createdAt: new Date().toISOString(),
      __system: true,
    };
    setMessages((p) => {
      if (p.some((m) => m.__system && m.message === text)) return p;
      return [...p, sysMsg];
    });
  }, []);

  return {
    conversation,
    setConversation,
    messages,
    startConversation,
    loadMessages,
    sendMessage,
    leaveConversation,
    sendLocalSystemMessage,
  };
}