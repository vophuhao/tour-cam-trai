/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useDirectMessage } from '@/hooks/useDirectMessage';
import { is } from 'date-fns/locale';

interface ChatWindowProps {
  conversation: any;
  onBack: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { user } = useAuthStore();
  const currentUserId = user?._id;

  const {
    messages,
    loading,
    sending,
    loadMessages,
    sendMessage: sendMsg,
    markAsRead,
  } = useDirectMessage();

  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevMessagesLenRef = useRef(0);

  const other = conversation.otherParticipant;
  const otherAvatar = other?.avatar || other?.userId?.avatar;
  const otherName = other?.name || other?.userId?.username || 'Người dùng';

  // Load messages khi vào
  useEffect(() => {
    if (!conversation?._id) return;

    (async () => {
      try {
        await loadMessages(conversation._id);
        await markAsRead(conversation._id);

        setTimeout(() => {
          const el = listRef.current;
          if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
        }, 100);

        setTimeout(() => inputRef.current?.focus(), 200);
      } catch (err) {
        console.error('Load messages error:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation._id]);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const prev = prevMessagesLenRef.current;
    const behavior: ScrollBehavior =
      prev === 0 || messages.length > prev + 1 ? 'auto' : 'smooth';

    el.scrollTo({ top: el.scrollHeight, behavior });
    prevMessagesLenRef.current = messages.length;
  }, [messages]);

  const send = async () => {
    if (!conversation?._id) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      await sendMsg(conversation._id, {
        message: trimmed,
        messageType: 'text',
      });
      setText('');
    } catch (err) {
      console.error('Send message failed:', err);
      alert('Gửi tin nhắn thất bại');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
        >
          ←
        </button>

        <div className="h-10 w-10 overflow-hidden rounded-full bg-white/20">
          {otherAvatar ? (
            <img src={otherAvatar} alt={otherName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-semibold text-white">
              {otherName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="font-semibold text-white">{otherName}</div>
          <div className="text-xs text-white/80">Đang hoạt động</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {loading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <span className="mb-2 text-4xl">👋</span>
            <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
          </div>
        )}

        {messages.map((m: any, i: number) => {
          console.log('Rendering message:', m);
          const senderId = m.senderId._id
        
          const isMine = senderId === currentUserId;
                     
          return (
            <div
              key={m._id || i}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                {!isMine && (
                  <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-blue-100">
                    {otherAvatar ? (
                      <img src={otherAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-blue-700">
                        {otherName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? 'rounded-br-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'rounded-bl-sm border border-gray-200 bg-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{m.message}</div>
                  <div
                    className={`mt-1 text-right text-[10px] ${
                      isMine ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {m.createdAt &&
                      new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t bg-white p-3">
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
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={sending}
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? '...' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
}