import { create } from "zustand";

interface ProfilePicModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useProfilePicModal = create<ProfilePicModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useProfilePicModal;
