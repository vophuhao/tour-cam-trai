/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import useSupportChat from '@/hooks/useSupportChat';
import { useAuthStore } from '@/store/auth.store';

export default function ChatModal() {
  const { user } = useAuthStore();
  const currentUserId = user?._id;

  const {
    conversation,
    startConversation,
    loadMessages,
    messages,
    sendMessage,
    leaveConversation,
    sendLocalSystemMessage,
  } = useSupportChat();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const greetedRef = useRef<Record<string, boolean>>({});
  const prevMessagesLenRef = useRef(0);
  const GREET_THROTTLE_MS = 5 * 60 * 1000;

  // open chat -> ensure conversation + load messages
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const conv = conversation ?? (await startConversation());
        // use returned msgs to decide greeting timing
        const msgs = await loadMessages(conv.conversationId);

        // ngay sau khi load xong: cuộn ngay xuống cuối (instant) để không thấy animation kéo từ trên xuống
        setTimeout(() => {
          try {
            const el = listRef.current;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
          } catch {
            /* ignore */
          }
        }, 0);

        // greet only when no messages and throttle allows
        try {
          const key = `support_greeted_ts:${conv.conversationId}`;
          const lastTs = Number(sessionStorage.getItem(key) || '0');
          if ((msgs?.length ?? 0) === 0 && Date.now() - lastTs >= GREET_THROTTLE_MS) {
            const greet = 'Xin chào! Tôi có thể hỗ trợ gì cho bạn?';
            sendLocalSystemMessage(conv.conversationId, greet);
            sessionStorage.setItem(key, String(Date.now()));
            greetedRef.current[conv.conversationId] = true;
          }
        } catch {
          // ignore
        }
        setTimeout(() => inputRef.current?.focus(), 120);
      } catch (err) {
        console.error('Start conversation error', err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // auto-scroll on new messages
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    const prev = prevMessagesLenRef.current;
    // nếu đây là lần load đầu (prev === 0) hoặc load batch nhiều tin (messages tăng lớn) -> instant
    // nếu chỉ 1 tin mới -> smooth
    const behavior: ScrollBehavior =
      prev === 0 || messages.length > prev + 1 ? 'auto' : 'smooth';
    el.scrollTo({ top: el.scrollHeight, behavior });
    prevMessagesLenRef.current = messages.length;
  }, [messages, open]);

  // click outside or Esc to close
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const panel = document.getElementById('support-chat-panel');
      if (panel && !panel.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // cleanup on close
  useEffect(() => {
    if (!open) {
      leaveConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const send = async () => {
    const convId = conversation?.conversationId;
    if (!convId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);

    try {
      await sendMessage(convId, trimmed, currentUserId);
      setText('');
    } catch (err) {
      console.error('send failed', err);
      alert('Gửi tin nhắn thất bại');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        aria-label="Open support chat"
        title="Chat hỗ trợ"
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <span className="text-xl">💬</span>
      </button>

      {open && (
        <div
          id="support-chat-panel"
          className="fixed z-50 bottom-20 right-6 w-80 h-[60vh] bg-white shadow-2xl rounded-lg flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Hỗ trợ trực tuyến"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                S
              </div>
              <div>
                <div className="text-sm font-medium">Hỗ trợ trực tuyến</div>
                <div className="text-xs text-gray-500">
                  {conversation ? 'Đang trò chuyện' : loading ? 'Kết nối...' : 'Chưa kết nối'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Đóng
            </button>
          </div>

          {/* Messages list */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {loading && (
              <div className="text-center text-sm text-gray-500">Đang tải lịch sử...</div>
            )}

            {!loading && messages.length === 0 && (
              <div className="text-center text-sm text-gray-500">Chưa có tin nhắn</div>
            )}

            {messages.map((m: any, i: number) => {
              const isMine = m.senderId === currentUserId;

              return (
                <div
                  key={m._id || i}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      isMine ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.message ?? m.content}</div>

                    <div className="text-[10px] text-gray-400 mt-1 text-right">
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                disabled={sending}
              />
              <button
                onClick={send}
                disabled={sending || !text.trim()}
                className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {sending ? 'Đang...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
