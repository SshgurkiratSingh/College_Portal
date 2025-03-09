import { create } from 'zustand';

interface FastMarksEntryModalStore {
  isOpen: boolean;
  projectId: string | null;
  onOpen: (projectId: string) => void;
  onClose: () => void;
}

const useFastMarksEntryModal = create<FastMarksEntryModalStore>((set) => ({
  isOpen: false,
  projectId: null,
  onOpen: (projectId: string) => set({ isOpen: true, projectId }),
  onClose: () => set({ isOpen: false }),
}));

export default useFastMarksEntryModal;