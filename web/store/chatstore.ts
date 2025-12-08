import { create } from 'zustand';

interface ChatModalStore {
  isOpen: boolean;
  targetUserId: string | null;
  openChat: (userId: string) => void;
  closeChat: () => void;
}

export const useChatModal = create<ChatModalStore>((set) => ({
  isOpen: false,
  targetUserId: null,
  openChat: (userId) => set({ isOpen: true, targetUserId: userId }),
  closeChat: () => set({ isOpen: false, targetUserId: null }),
}));