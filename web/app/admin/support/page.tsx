/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useMemo, useState } from "react";
import useAdminSupportChat from "@/hooks/useSupportChatAdmin";
import { useAuthStore } from "@/store/auth.store";

export default function AdminSupportPanel() {
  const {
    conversations, loadConversations, loadingConvs,
    selected, selectConversation,
    messages, loadingMsgs, sendReply
  } = useAdminSupportChat();

  const [query, setQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const {user} = useAuthStore();

  const filtered = useMemo(() => {
    if (!query) return conversations;
    return conversations.filter(c =>
      (c.customerName || "").toLowerCase().includes(query.toLowerCase()) ||
      (c.lastMessage || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [conversations, query]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  return (
    <div className="flex h-full">
      {/* LEFT PANEL – conversations list */}
      <div className="w-80 border-r p-3 flex flex-col">
        <div className="mb-3">
          <input
            placeholder="Tìm kiếm..."
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            className="w-full px-2 py-1 border rounded"
          />
        </div>

        <div className="flex-1 overflow-auto">
          {loadingConvs && (
            <div className="text-sm text-gray-500">Đang tải...</div>
          )}

          {filtered.map(conv => (
            <div
              key={conv.conversationId}
              onClick={() => selectConversation(conv)}
              className={`p-2 rounded cursor-pointer hover:bg-gray-50 ${
                selected?.conversationId === conv.conversationId ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex justify-between">
                <div className="font-medium text-sm">
                  {conv.customerName || "Khách hàng"}
                </div>

                {conv.unreadCountSeller > 0 && (
                  <div className="bg-red-500 text-white text-xs px-2 rounded">
                    {conv.unreadCountSeller}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-600 truncate">
                {conv.lastMessage ?? "—"}
              </div>

              <div className="text-[11px] text-gray-400">
                {conv.lastMessageAt
                  ? new Date(conv.lastMessageAt).toLocaleString()
                  : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL – messages */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b">
          <div className="font-semibold">
            {selected?.customerName ?? "Chọn conversation"}
          </div>
          <div className="text-sm text-gray-500">
            {selected?.customerAvatar ?? ""}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-3 bg-slate-50">
          {loadingMsgs && (
            <div className="text-sm text-gray-500">Đang tải tin nhắn...</div>
          )}

          {!loadingMsgs && messages.length === 0 && (
            <div className="text-sm text-gray-500">Chưa có tin nhắn</div>
          )}

          {messages.map((m: any, i: number) => {
            const isCustomer = m.senderId != user?._id

            return (
              <div
                key={m._id || i}
                className={`mb-3 flex ${isCustomer ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`px-3 py-2 rounded max-w-[75%] text-sm ${
                    isCustomer
                      ? "bg-white border border-gray-300"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <div>{m.message ?? m.content}</div>

                  <div className="text-xs text-gray-300 mt-1 text-right">
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input composer */}
        <div className="p-3 border-t bg-white">
          <div className="flex gap-2">
            <input
              value={replyText}
              onChange={(e)=>setReplyText(e.target.value)}
              placeholder={
                selected ? "Trả lời..." : "Chọn conversation để trả lời"
              }
              disabled={!selected}
              className="flex-1 px-3 py-2 border rounded"
            />

            <button
              onClick={async () => {
                if (!selected || !replyText.trim()) return;
                try {
                  await sendReply(selected.conversationId, replyText.trim(), String(user?._id ?? ""))
                  setReplyText("");
                } catch (err) {
                  alert("Gửi thất bại");
                }
              }}
              disabled={!selected || !replyText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
