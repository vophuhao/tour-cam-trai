/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useDirectMessage } from '@/hooks/useDirectMessage';
import { useSocket } from '@/provider/socketProvider';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

interface Conversation {
  _id: string;
  conversationId: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  otherParticipant: {
    _id: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
}

export default function HostSupportPage() {
  const { user } = useAuthStore();
  const currentUserId = user?._id;
  const { socket } = useSocket();

  const {
    messages,
    loading: loadingMsgs,
    sending,
    loadMessages,
    sendMessage: sendMsg,
    markAsRead,
    isConnected,
  } = useDirectMessage();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLenRef = useRef(0);

  const getDisplayName = (participant: { username?: string; name?: string }) => {
    return participant.username || participant.name || 'Người dùng';
  };

  const getFirstLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConvs(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/messages/conversations`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setConversations(data.data || []);
      }
    } catch (err) {
      console.error('Load conversations error:', err);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  const sendReply = async () => {
    if (!selectedConv?._id) return;
    const trimmed = replyText.trim();
    if (!trimmed) return;

    try {
      await sendMsg(selectedConv._id, {
        message: trimmed,
        messageType: 'text',
      });
      setReplyText('');
    } catch (err) {
      console.error('[HostSupport] Send message failed:', err);
      alert('Gửi tin nhắn thất bại');
    }
  };

  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;

    const prev = prevMessagesLenRef.current;
    const behavior: ScrollBehavior =
      prev === 0 || messages.length > prev + 1 ? 'auto' : 'smooth';

    el.scrollTo({ top: el.scrollHeight, behavior });
    prevMessagesLenRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleConversationUpdate = (data: any) => {
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv._id === data.conversationId) {
            return {
              ...conv,
              lastMessage: data.lastMessage,
              lastMessageAt: data.lastMessageAt,
              unreadCount: selectedConv?._id === conv._id ? 0 : (data.unreadCount ?? conv.unreadCount),
            };
          }
          return conv;
        });
        
        // Sort by lastMessageAt
        return updated.sort((a, b) => {
          const aTime = new Date(a.lastMessageAt || 0).getTime();
          const bTime = new Date(b.lastMessageAt || 0).getTime();
          return bTime - aTime;
        });
      });
    };

    const handleNewMessage = (data: any) => {
      // If message is in current conversation, mark as read
      if (selectedConv?._id === data.conversationId) {
        markAsRead(data.conversationId);
      } else {
        // Update unread count for other conversations
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === data.conversationId
              ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
              : conv
          )
        );
      }
    };

    socket.on('conversation_updated', handleConversationUpdate);
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('conversation_updated', handleConversationUpdate);
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, user, selectedConv, markAsRead]);

  const filteredConvs = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(c => {
      const name = getDisplayName(c.otherParticipant).toLowerCase();
      const lastMsg = (c.lastMessage || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || lastMsg.includes(query);
    });
  }, [conversations, searchQuery]);

  const handleSelectConv = async (conv: Conversation) => {
    setSelectedConv(conv);
    
    // Reset unread count immediately
    setConversations((prev) =>
      prev.map((c) =>
        c._id === conv._id ? { ...c, unreadCount: 0 } : c
      )
    );
    
    try {
      await loadMessages(conv._id);
      await markAsRead(conv._id);

      setTimeout(() => {
        const el = messagesEndRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
      }, 100);

      setTimeout(() => inputRef.current?.focus(), 200);
    } catch (err) {
      console.error('[HostSupport] Load messages error:', err);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Panel */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-5 py-4">
          <h1 className="text-lg font-semibold text-gray-900">Tin nhắn</h1>
          <p className="mt-0.5 text-sm text-gray-500">{conversations.length} cuộc trò chuyện</p>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 px-4 py-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          )}

          {!loadingConvs && filteredConvs.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">
              Chưa có tin nhắn
            </div>
          )}

          {filteredConvs.map((conv) => {
            const isSelected = selectedConv?._id === conv._id;
            const hasUnread = conv.unreadCount > 0;
            const displayName = getDisplayName(conv.otherParticipant);

            return (
              <button
                key={conv._id}
                onClick={() => handleSelectConv(conv)}
                className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {conv.otherParticipant.avatar ? (
                      <img
                        src={conv.otherParticipant.avatar}
                        alt={displayName}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                        {getFirstLetter(displayName)}
                      </div>
                    )}
                    {hasUnread && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm ${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {displayName}
                      </p>
                      <span className="flex-shrink-0 text-xs text-gray-400">
                        {conv.lastMessageAt &&
                          new Date(conv.lastMessageAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                      </span>
                    </div>
                    <p className={`mt-0.5 truncate text-xs ${hasUnread ? 'font-medium text-gray-600' : 'text-gray-500'}`}>
                      {conv.lastMessage || 'Chưa có tin nhắn'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-3">
              <div className="relative">
                {selectedConv.otherParticipant.avatar ? (
                  <img
                    src={selectedConv.otherParticipant.avatar}
                    alt={getDisplayName(selectedConv.otherParticipant)}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                    {getFirstLetter(getDisplayName(selectedConv.otherParticipant))}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500"></span>
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {getDisplayName(selectedConv.otherParticipant)}
                </p>
                <p className="text-xs text-gray-500">
                  {isConnected ? 'Đang hoạt động' : 'Ngoại tuyến'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesEndRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
              {loadingMsgs && (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}

              {!loadingMsgs && messages.length === 0 && (
                <div className="py-16 text-center text-sm text-gray-500">
                  Chưa có tin nhắn
                </div>
              )}

              {messages.map((msg: any, i: number) => {
                const senderId = msg.senderId?._id;
                const isHost = senderId === currentUserId;

                return (
                  <div
                    key={msg._id || i}
                    className={`flex ${isHost ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${msg.__optimistic ? 'opacity-60' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm ${
                          isHost
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 shadow-sm'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <div className={`mt-1 flex items-center gap-1 text-xs text-gray-400 ${isHost ? 'justify-end' : ''}`}>
                        {msg.createdAt &&
                          new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        {isHost && msg.isRead && (
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
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                  disabled={sending || !isConnected}
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim() || !isConnected}
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
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <svg className="mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium">Chọn một cuộc trò chuyện</p>
            <p className="mt-1 text-xs text-gray-400">Chọn khách hàng để bắt đầu hỗ trợ</p>
          </div>
        )}
      </div>
    </div>
  );
}