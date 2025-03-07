import { create } from "zustand";

interface UpdateBodyStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useUpdateBody = create<UpdateBodyStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useUpdateBody;
