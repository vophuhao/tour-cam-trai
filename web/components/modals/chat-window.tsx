/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useDirectMessage } from '@/hooks/useDirectMessage';

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
        isConnected,
    } = useDirectMessage();

    const [text, setText] = useState('');
    const listRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const prevMessagesLenRef = useRef(0);

    const other = conversation.otherParticipant;
    const otherAvatar = other?.avatarUrl || other?.userId?.avatarUrl;
    const otherName = other?.name || other?.userId?.username || 'Người dùng';

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
                console.error('[ChatWindow] Load messages error:', err);
            }
        })();
    }, [conversation._id, loadMessages, markAsRead]);

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
            console.error('[ChatWindow] Send message failed:', err);
            alert('Gửi tin nhắn thất bại');
        }
    };

    return (
        <div className="flex h-full flex-col bg-white">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
                <button
                    onClick={onBack}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="relative">
                    {otherAvatar ? (
                        <img src={otherAvatar} alt={otherName} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                            {otherName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500"></span>
                </div>

                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{otherName}</p>
                    <p className="text-xs text-gray-500">
                        {isConnected ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="py-16 text-center text-sm text-gray-500">
                        Chưa có tin nhắn
                    </div>
                )}

                {messages.map((m: any, i: number) => {
                    const senderId = m.senderId?._id;
                    const isMine = senderId === currentUserId;

                    return (
                        <div
                            key={m._id || i}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] ${m.__optimistic ? 'opacity-60' : ''}`}>
                                <div
                                    className={`rounded-2xl px-4 py-2 text-sm ${
                                        isMine
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-900 shadow-sm'
                                    }`}
                                >
                                    {m.message}
                                </div>
                                <div className={`mt-1 flex items-center gap-1 text-xs text-gray-400 ${isMine ? 'justify-end' : ''}`}>
                                    {m.createdAt &&
                                        new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    {isMine && m.isRead && (
                                        <svg className="h-3 w-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
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
                        placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={sending || !isConnected}
                    />
                    <button
                        onClick={send}
                        disabled={sending || !text.trim() || !isConnected}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {sending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}