/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import ChatWindow from './chat-window';
import { getUserConversations, searchUsers } from '@/lib/client-actions';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

export default function ConversationsList() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Load conversations khi mở
  useEffect(() => {
    if (!open || !user) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const res = await getUserConversations();
        setConversations(res.data || []);
      } catch (err) {
        console.error('Load conversations error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [open, user]);

  // Search users
  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchUser = async () => {
      try {
        setSearching(true);
        console.log('Searching for:', searchQuery);
        const res = await searchUsers(searchQuery); // Đây là từ client-actions.ts

        if (res.success) {
          setSearchResults(res.data || []);
          setShowSearchResults(true);
        }
      } catch (err) {
        console.error('Search users error:', err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchUser, 300); // ✅ Gọi searchUser (local function)
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Click outside để đóng
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const panel = document.getElementById('conversations-panel');
      if (panel && !panel.contains(e.target as Node)) {
        setOpen(false);
        setSelectedConversation(null);
        setSearchQuery('');
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Start chat with searched user
  const startChatWithUser = async (otherUserId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/messages/conversations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otherUserId }),
      });

      if (res.ok) {
        const body = await res.json();
        setSelectedConversation(body.data);
        setSearchQuery('');
        setShowSearchResults(false);
      }
    } catch (err) {
      console.error('Start chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Tin nhắn"
      >
        <span className="text-2xl">💬</span>
        {conversations.some((c) => c.unreadCount > 0) && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          id="conversations-panel"
          className="fixed bottom-24 right-6 z-50 flex h-[600px] w-96 flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        >
          {/* Nếu chưa chọn conversation -> hiện danh sách */}
          {!selectedConversation ? (
            <>
              {/* Header */}
              <div className="border-b bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
                <h2 className="text-lg font-semibold text-white">Tin nhắn</h2>
              </div>

              {/* Search bar */}
              <div className="border-b bg-white px-4 py-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm người dùng..."
                    className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search results hoặc Conversations list */}
              <div className="flex-1 overflow-y-auto">
                {showSearchResults ? (
                  // Search Results
                  <>
                    {searchResults.length === 0 && !searching && (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <span className="mb-2 text-4xl">🔍</span>
                        <p className="text-sm">Không tìm thấy người dùng</p>
                      </div>
                    )}

                    {searchResults.map((searchUser) => (
                      <button
                        key={searchUser._id}
                        onClick={() => startChatWithUser(searchUser._id)}
                        className="flex w-full items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                          {searchUser.avatar ? (
                            <img
                              src={searchUser.avatar}
                              alt={searchUser.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white">
                              {searchUser.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">
                            {searchUser.username || searchUser.full_name}
                          </div>
                          {searchUser.email && (
                            <div className="text-xs text-gray-500">{searchUser.email}</div>
                          )}
                        </div>

                        <div className="text-xs text-blue-600">Nhắn tin</div>
                      </button>
                    ))}
                  </>
                ) : (
                  // Conversations List
                  <>
                    {loading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}

                    {!loading && conversations.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <span className="mb-2 text-4xl">💬</span>
                        <p className="text-sm">Chưa có tin nhắn nào</p>
                        <p className="mt-1 text-xs">Tìm kiếm người dùng để bắt đầu chat</p>
                      </div>
                    )}

                    {!loading &&
                      conversations.map((conv) => {
                        const other = conv.otherParticipant;
                        const avatar = other?.avatar || other?.userId?.avatar;
                        const name = other?.name || other?.userId?.username || 'Người dùng';
                        const hasUnread = conv.unreadCount > 0;

                        return (
                          <button
                            key={conv._id}
                            onClick={() => setSelectedConversation(conv)}
                            className="flex w-full items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-gray-50"
                          >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                                {avatar ? (
                                  <img
                                    src={avatar}
                                    alt={name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-white">
                                    {name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              {hasUnread && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 overflow-hidden text-left">
                              <div
                                className={`truncate text-sm ${hasUnread ? 'font-semibold' : 'font-medium'}`}
                              >
                                {name}
                              </div>
                              <div
                                className={`truncate text-xs ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                              >
                                {conv.lastMessage || 'Bắt đầu trò chuyện'}
                              </div>
                            </div>

                            {/* Time */}
                            <div className="flex-shrink-0 text-xs text-gray-400">
                              {conv.lastMessageAt &&
                                new Date(conv.lastMessageAt).toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                })}
                            </div>
                          </button>
                        );
                      })}
                  </>
                )}
              </div>
            </>
          ) : (
            // Nếu đã chọn -> hiện chat window
            <ChatWindow
              conversation={selectedConversation}
              onBack={() => {
                setSelectedConversation(null);
                setSearchQuery('');
                setShowSearchResults(false);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}