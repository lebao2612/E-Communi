import { create } from 'zustand';

interface UIStoreState {
  isCreatePostModalOpen: boolean;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
  setCreatePostModalOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  isCreatePostModalOpen: false,

  openCreatePostModal: () => set({ isCreatePostModalOpen: true }),

  closeCreatePostModal: () => set({ isCreatePostModalOpen: false }),

  setCreatePostModalOpen: (isOpen) => set({ isCreatePostModalOpen: isOpen }),
}));
