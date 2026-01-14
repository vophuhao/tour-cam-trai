import { create } from 'zustand';

interface ChatModalStore {
  isOpen: boolean;
  targetUserId: string | null;
  targetUserInfo: {
    username?: string;
    avatarUrl?: string;
    email?: string;
  } | null;
  openChat: (userId: string, userInfo?: { username?: string; avatarUrl?: string; email?: string }) => void;
  closeChat: () => void;
}

export const useChatModal = create<ChatModalStore>((set) => ({
  isOpen: false,
  targetUserId: null,
  targetUserInfo: null,
  openChat: (userId, userInfo) => set({ 
    isOpen: true, 
    targetUserId: userId,
    targetUserInfo: userInfo || null 
  }),
  closeChat: () => set({ 
    isOpen: false, 
    targetUserId: null,
    targetUserInfo: null 
  }),
}));