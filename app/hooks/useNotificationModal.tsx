import { create } from "zustand";

interface NotificationModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useNotificationModal = create<NotificationModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useNotificationModal;
